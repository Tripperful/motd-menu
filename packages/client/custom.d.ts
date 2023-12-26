declare module '*.svg' {
  import { FC, SVGAttributes } from 'react';
  export const ReactComponent: FC<SVGAttributes<SVGElement>>;

  export default ReactComponent;
}

declare module '*.svg?url' {
  const src: string;

  export default src;
}

declare module '*.png' {
  const src: string;

  export default src;
}

declare module '*.webm' {
  const src: string;

  export default src;
}
