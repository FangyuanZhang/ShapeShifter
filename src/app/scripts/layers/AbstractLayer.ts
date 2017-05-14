import * as _ from 'lodash';
import { Layer, ClipPathLayer, PathLayer } from '.';
import { Property, NameProperty, Inspectable, Animatable } from '../properties';

/**
 * Root class for all layer types.
 */
@Property.register(
  new NameProperty('name'),
)
export abstract class AbstractLayer implements Layer {

  constructor(obj: ConstructorArgs) {
    this.id = obj.id || _.uniqueId();
    this.name = obj.name || '';
    this.children = obj.children || [];
  }

  // Implements the Layer interface.
  findLayerById(id: string): Layer | undefined {
    if (this.id === id) {
      return this;
    }
    for (const child of this.children) {
      const layer = child.findLayerById(id);
      if (layer) {
        return layer;
      }
    }
    return undefined;
  }

  // Implements the Layer interface.
  findLayerByName(name: string): Layer | undefined {
    if (this.name === name) {
      return this;
    }
    for (const child of this.children) {
      const layer = child.findLayerByName(name);
      if (layer) {
        return layer;
      }
    }
    return undefined;
  }

  // Implements the Layer interface.
  isMorphableWith(layer: Layer) {
    if (this.constructor !== layer.constructor) {
      return false;
    }
    if (this instanceof PathLayer || this instanceof ClipPathLayer) {
      return this.pathData.isMorphableWith((layer as any).pathData);
    }
    return this.children.length === layer.children.length
      && this.children.every((c, i) => c.isMorphableWith(layer.children[i]));
  }

  // Implements the Layer interface.
  walk(beforeFn: (layer: Layer) => void) {
    const visitFn = (layer: Layer) => {
      beforeFn(layer);
      if (layer.children) {
        layer.children.forEach(l => visitFn(l));
      }
    };
    visitFn(this);
  }

  abstract clone<T extends Layer>(): T;
  abstract deepClone<T extends Layer>(): T;
  abstract interpolate(start: AbstractLayer, end: AbstractLayer, fraction: number): void;
  abstract getIconName(): string;
  abstract getPrefix(): string;
}

// TODO: share this interface with Layer?
interface AbstractLayerArgs {
  id?: string;
  name: string;
  children: ReadonlyArray<Layer>;
}

export interface AbstractLayer extends AbstractLayerArgs, Inspectable, Animatable { }

// tslint:disable-next-line
export interface ConstructorArgs extends AbstractLayerArgs { }
