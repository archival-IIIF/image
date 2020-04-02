import * as sharp from 'sharp';

export interface ImageRequest {
    parseImageRequest(size: Size): void;
    requiresImageProcessing(): boolean;
    executeImageProcessing(image: sharp.Sharp): void;
}

export interface Size {
    width: number;
    height: number;
}

export default class ImageProcessing {
    constructor(private path: string, private requests: ImageRequest[]) {
    }

    async process(): Promise<{ data: Buffer, info: sharp.OutputInfo }> {
        const size = await this.getSize();
        this.requests.forEach(request => request.parseImageRequest(size));

        const pipeline = this.getPipeline();
        if (this.requests.filter(request => request.requiresImageProcessing()).length > 0)
            this.requests.forEach(request => request.executeImageProcessing(pipeline));

        return pipeline.toBuffer({resolveWithObject: true});
    }

    private getPipeline(): sharp.Sharp {
        return sharp(this.path);
    }

    private async getSize(): Promise<Size> {
        const pipeline = this.getPipeline();
        const metadata = await pipeline.metadata();
        return {width: metadata.width as number, height: metadata.height as number};
    }
}
