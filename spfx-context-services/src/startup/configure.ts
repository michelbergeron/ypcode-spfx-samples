/*
I'll let you read the comments in this code exhibit above to understand what we do. 

The idea is that we always create a child scope that will pertain to the component instance, 
all the services from the root scope will be accessible from it anyway. 

The "tricky" part is that all the services that depends on the component specific services should be instantiated in that new child scope. 
That is probably not the best since, some of them can be generic enough that they actually don't need to be duplicated, 
but since they are created with the service scope, it seems to be the only way. 

This configure() method has then to be called in the init event of the component (the WebPart) class, 
and a reference to the newly created child service scope should be kept. 

This child scope reference can then be passed as property to the React component we use as you can see in the render() method.
*/
import { ServiceScope } from "@microsoft/sp-core-library";
import { BaseComponentContext } from "@microsoft/sp-component-base";
import { ComponentContextServiceKey, ComponentContextService } from "../services/ComponentContextService";
import { DocumentsServiceKey, DocumentsService } from "../services/DocumentsService";
import { PageContextServiceKey } from "../services/PageContextService";
import { ISpContextServiceLabWebPartProps } from "../webparts/spContextServiceLab/SpContextServiceLabWebPart";

export const configure = (componentContext: BaseComponentContext, properties: ISpContextServiceLabWebPartProps): Promise<ServiceScope> => {
    const rootScope = componentContext.serviceScope;

    return new Promise((resolve, reject) => {
        try {
            // The default implementation of all services (built-in AND custom) are available at root scope
            // We should be extremely cautious of altering a root-scoped service 'state' from a specific component instance
            // This might be not that important in the context of an app-part page        
            // All services directly usable from root scope should not have any component-specific dependencies
            const pageContextService = rootScope.consume(PageContextServiceKey);
            pageContextService.configure(componentContext);

            const scopedService = rootScope.startNewChild();
            // TODO Here create and initialize the component scoped custom service instances
            // TODO Initialize and configure scoped services based on component configuration

            // The component-scoped context should be created here to ensure it will remain tied to the proper instance
            const componentContextService = scopedService.createAndProvide(ComponentContextServiceKey, ComponentContextService);
            componentContextService.configure(componentContext, properties);

            // Create and provide new instances of services that uses component specific context (configuration, instance id, ...)
            // (e.g. In this example the Documents service relies of the component configuration)
            scopedService.createAndProvide(DocumentsServiceKey, DocumentsService);

            // Finish the child scope initalization
            scopedService.finish();

            resolve(scopedService);

        } catch (error) {
            reject(error);
        }
    });
};
