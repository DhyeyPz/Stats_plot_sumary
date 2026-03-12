export class OutbReader {
  constructor(file) {
    this.file = file;
    this.headerParsed = false;
    this.channelNames = [];
    this.channelUnits = [];
  }

  async readHeader() {
    if (this.headerParsed) return;
    const headerSlice = await this.file.slice(0, 100000).arrayBuffer();
    const view = new DataView(headerSlice);
    let offset = 0;

    const readInt16 = () => { const v = view.getInt16(offset, true); offset += 2; return v; };
    const readInt32 = () => { const v = view.getInt32(offset, true); offset += 4; return v; };
    const readFloat32 = () => { const v = view.getFloat32(offset, true); offset += 4; return v; };
    const readFloat64 = () => { const v = view.getFloat64(offset, true); offset += 8; return v; };
    
    const readString = (len) => {
      let str = "";
      for (let i = 0; i < len; i++) str += String.fromCharCode(view.getUint8(offset++));
      // CRITICAL: .trim() here so "GenPwr  " becomes "GenPwr"
      return str.trim(); 
    };

    this.fileID = readInt16();
    this.lenName = (this.fileID === 4) ? readInt16() : 10;
    this.numOutChans = readInt32();
    this.NT = readInt32();
    this.timeStart = readFloat64();
    this.timeIncr = readFloat64();

    this.colScl = [];
    for (let i = 0; i < this.numOutChans; i++) this.colScl.push(readFloat32() || 1.0);
    this.colOff = [];
    for (let i = 0; i < this.numOutChans; i++) this.colOff.push(readFloat32());

    const lenDesc = readInt32();
    offset += lenDesc;

    const totalChannels = this.numOutChans + 1;
    // Read names and units with trimming
    for (let i = 0; i < totalChannels; i++) this.channelNames.push(readString(this.lenName));
    for (let i = 0; i < totalChannels; i++) {
      const rawUnit = readString(this.lenName);
      this.channelUnits.push(rawUnit.replace(/[()]/g, ""));
    }

    this.dataStartOffset = offset;
    this.headerParsed = true;
  }

  getMetadata() {
    return {
      headers: this.channelNames,
      unitMap: Object.fromEntries(this.channelNames.map((h, i) => [h, this.channelUnits[i]])),
      NT: this.NT
    };
  }

  async getChannelData(channelName) {
    await this.readHeader();
    // Now searching works because both sides are trimmed
    const channelIndex = this.channelNames.indexOf(channelName.trim());
    if (channelIndex === -1) throw new Error(`Channel ${channelName} not found`);

    const x = new Float64Array(this.NT);
    const y = new Float64Array(this.NT);
    const bytesPerRow = this.numOutChans * 2;

    if (channelIndex === 0) {
      for (let i = 0; i < this.NT; i++) x[i] = y[i] = this.timeStart + i * this.timeIncr;
      return { x, y };
    }

    const dataIndex = channelIndex - 1;
    const buffer = await this.file.slice(this.dataStartOffset, this.dataStartOffset + (this.NT * bytesPerRow)).arrayBuffer();
    const view = new DataView(buffer);

    for (let i = 0; i < this.NT; i++) {
      x[i] = this.timeStart + i * this.timeIncr;
      const packed = view.getInt16((i * bytesPerRow) + (dataIndex * 2), true);
      y[i] = (packed - this.colOff[dataIndex]) / this.colScl[dataIndex];
    }
    return { x, y };
  }
}