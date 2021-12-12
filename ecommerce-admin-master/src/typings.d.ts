import { Type } from "@angular/core";

/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}
declare module "@angular/core" {
  interface ModuleWithProviders<T = any> {
      ngModule: Type<T>;
      providers?: Provider[];
  }
}
