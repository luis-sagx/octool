declare module 'imagetracerjs' {
  interface ImageTracerOptions {
    ltres?: number;
    qtres?: number;
    pathomit?: number;
    colorsampling?: number;
    numberofcolors?: number;
    mincolorratio?: number;
    colorquantcycles?: number;
    scale?: number;
    simplifytolerance?: number;
    roundcoords?: number;
    viewbox?: boolean;
    desc?: boolean;
    noorb?: boolean;
    noprogress?: boolean;
    whitespace?: boolean;
  }

  const ImageTracer: {
    imagedataToSVG(imagedata: ImageData, options?: ImageTracerOptions): string;
  };

  export default ImageTracer;
}