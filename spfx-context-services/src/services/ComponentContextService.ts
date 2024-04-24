/*
 This service has a configure() method that should be called at startup of the component, 
 the other are only the properties specific to the component instance we want to "expose", 
 it includes here the instance Id as well as the WebPart properties (we also could have mapped each single property to only expose the one we want). 
 
 Notice in the configure() method I set a watch guard to avoid that the current instance of the service is configured more than once by mistake, 
 that will ensure that we use a component-specific instance from the child scope.
 */
import { BaseComponentContext } from "@microsoft/sp-component-base";
import { ServiceKey, ServiceScope } from "@microsoft/sp-core-library";
import { ISpContextServiceLabWebPartProps } from "../webparts/spContextServiceLab/SpContextServiceLabWebPart";

export interface IComponentContextService {
    configure(spfxComponentContext: BaseComponentContext, properties: ISpContextServiceLabWebPartProps,force?:boolean): void;
    instanceId: string;
    properties: ISpContextServiceLabWebPartProps;
    // TODO Expose any needed component specific property
    // NOTE Avoid simply exposing the whole WebPart/Component context
    // Exposing only the needed information in that service allows to have better control
    // and better understanding of what's really component specific or not
    // It also mitigates risk of unexpected behavior in OTB API
}

export class ComponentContextService implements IComponentContextService {

    private _instanceId: string = null;
    private _properties: ISpContextServiceLabWebPartProps = null;
    private _configured: boolean = false;

    constructor(private serviceScope: ServiceScope) { }

    public configure(spfxComponentContext: BaseComponentContext, properties: ISpContextServiceLabWebPartProps, force:boolean=false): void {

        if (this._configured && !force) {
            throw new Error("The ComponentContext Service has already been configured. Please review the configure() call");
        }

        this._instanceId = (spfxComponentContext && spfxComponentContext.instanceId) || null;
        this._properties = properties;
        this._configured = (this._instanceId && this._properties && true) || false;
    }

    public get instanceId(): string {
        if (!this._configured) {
            throw new Error("The Component Context Service has not been properly configured.");
        }

        return this._instanceId;
    }

    public get properties(): ISpContextServiceLabWebPartProps {
        if (!this._configured) {
            throw new Error("The Component Context Service has not been properly initialized.");
        }

        return this._properties;
    }
}

export const ComponentContextServiceKey = ServiceKey.create<IComponentContextService>("ypcode::ComponentContextService", ComponentContextService);
