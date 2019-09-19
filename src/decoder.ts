export class Decoder {
    /**
     * Decodes audio file.
     * @param file file to decode.
     * @param progressCallback [optional] progress callback with
     *      currently processed and total byte count.
     * @returns decoded AudioBuffer that can be used in BufferManipulator.
     */
    public async decodeFile(
        file: File | Blob,
        progressCallback?: (processed: number, total: number) => void,
    ): Promise<AudioBuffer> {
        return new Promise<AudioBuffer>((resolve, reject): void => {

            if (!this.fileReader) {
                this.fileReader = new FileReader();
            }
            if (this.fileReader.readyState === FileReader.LOADING) {
                this.fileReader.abort();
            }

            this.fileReader.onprogress = (e): void => {
                if (progressCallback) {
                    progressCallback(e.loaded, e.total);
                }
            };
            this.fileReader.onload = (e): void => {
                if (progressCallback) {
                    progressCallback(e.loaded, e.total);
                }
                if (this.fileReader && this.fileReader.result instanceof ArrayBuffer) {
                    const resultBuffer = this.fileReader.result;
                    resolve(this.decodeArrayBuffer(resultBuffer));
                } else {
                    reject('Something went wrong while decoding file.');
                }
            };
            this.fileReader.readAsArrayBuffer(file);
        });
    }

    /**
     * Abort decoding fromFile process if it's currently running.
     */
    public abort(): void {
        if (this.fileReader && this.fileReader.readyState === FileReader.LOADING) {
            this.fileReader.abort();
        }
    }

    /**
     * Decodes arrayBuffer directly.
     * @param arrayBuffer already valid ArrauBuffer instance containing audio file data.
     * @returns decoded AudioBuffer that can be used in BufferManipulator.
     */
    public async decodeArrayBuffer(arrayBuffer: ArrayBuffer): Promise<AudioBuffer> {
        const audioContext = new AudioContext();
        const decodedBuffer = await audioContext.decodeAudioData(arrayBuffer);
        return decodedBuffer;
    }

    private fileReader: FileReader | undefined;
}
