export class OutbReader {
  constructor(file) {
    this.file = file;
    this.headerParsed = false;
    this.channelNames = [];
    this.channelUnits = [];

    this.cachedBuffer = null;
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
    const channelIndex = this.channelNames.indexOf(channelName.trim());
    
    // 👇 FIX: Do NOT throw an error. Return null gracefully so the app continues.
    if (channelIndex === -1) {
       console.warn(`Channel ${channelName} not found in ${this.file.name}`);
       return { y: null }; 
    }

    // 👇 ADDED THIS CACHING BLOCK
    if (!this.cachedBuffer) {
      this.cachedBuffer = await this.file.arrayBuffer();
    }

    // DATA EXTRACTION LOGIC using this.cachedBuffer
    const x = new Float64Array(this.NT);
    const y = new Float64Array(this.NT);
    const bytesPerRow = this.numOutChans * 2;

    if (channelIndex === 0) {
      for (let i = 0; i < this.NT; i++) {
        x[i] = y[i] = this.timeStart + i * this.timeIncr;
      }
      return { x, y };
    }

    const dataIndex = channelIndex - 1;
    // Use the cached buffer directly
    const view = new DataView(this.cachedBuffer);

    for (let i = 0; i < this.NT; i++) {
      x[i] = this.timeStart + i * this.timeIncr;
      
      // IMPORTANT: We now add dataStartOffset because we are viewing the WHOLE buffer
      const offset = this.dataStartOffset + (i * bytesPerRow) + (dataIndex * 2);
      
      const packed = view.getInt16(offset, true);
      y[i] = (packed - this.colOff[dataIndex]) / this.colScl[dataIndex];
    }

    return { x, y };
}


}