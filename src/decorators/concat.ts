import {Subscription} from "rxjs";

export function concat(idSelector?: (args) => string): MethodDecorator {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const original = descriptor.value;
        const subscriptions: { [id: string]: Subscription } = {};
        const isSubscriptionExists = (id) => {
            return subscriptions[id] != null;
        };

        descriptor.value = function () {
            const id = idSelector ? idSelector(arguments) : 0;

            if (!isSubscriptionExists(id)) {
                const subscription = subscriptions[id] = original.apply(this, arguments) as Subscription;

                if (!subscription || !(subscription instanceof Subscription)) {
                    const error = new Error(`Method should return subscription ${target} ${descriptor}`);
                    throw error;
                }

                subscription.add(() => {
                    delete subscriptions[id];
                });
            }
        };

        return descriptor;
    };
}
