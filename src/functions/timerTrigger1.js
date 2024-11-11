const { app } = require('@azure/functions');
const optimizelySdk = require('@optimizely/optimizely-sdk');

// event properties possible values
const items_category = ["men","women","kids","sport"];
const items_subcategory = ["shoes","trousers","jackets","hats"];
const items_saleitem = [true,false];

app.timer('timerTrigger1', {
    // schedule: '0 */5 * * * *', 5min schedule for debugging purposes
    schedule: '0 */15 * * * *', //15min schedule
    handler: (myTimer, context) => {
        // context.log('Timer function processed request.');

        function getRandomInt(max) {
            return Math.floor(Math.random() * max);
        }

        // Arrow function to return a random item from the array
        const random_item = items => items[Math.floor(Math.random() * items.length)];

        function getRandomIntInclusive(min, max) {
            const minCeiled = Math.ceil(min);
            const maxFloored = Math.floor(max);
            return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
          }
          
        function lowEventDispatcher(user, event, tags)
        //25% chance of sending an event
        {
            eventrandomiser = getRandomInt(12);
            if (eventrandomiser <= 3) {
                user.trackEvent(event, tags);
                console.log('OPTI lowevent dispatched ', event, ' tags if present ', tags);
            }
        }     
        
        function normalEventDispatcher(user, event, tags)
        //50% chance of sending an event
        {
            eventrandomiser = getRandomInt(10);
            if (eventrandomiser > 5) {
                user.trackEvent(event, tags);
                console.log('OPTI normalevent dispatched', event, 'tags if present ', tags);
            }
        }   
        
        function highEventDispatcher(user, event, tags)
        // 75% chance of sending an event
        {
            eventrandomiser = getRandomInt(12);
            if (eventrandomiser <= 9) {
                user.trackEvent(event, tags);
                console.log('OPTI highevent dispatched', event, 'tags if present ', tags);
            }
        }     

        const optimizely = optimizelySdk.createInstance({
            sdkKey: 'Ay6RMNd5gcpbVXGAonjB5',
        });

        optimizely.onReady().then(({ success, reason }) => {
            if (!success) {
                console.log(`OPTI client initialization unsuccessful, reason: ${reason}`);
                return;
            }

            let hasOnFlags = false;
            for (let i = 0; i < getRandomIntInclusive(75, 200); i++) {
                // Random generation of users between 75-200 each run
                const userId = (Math.floor(Math.random() * (10000 - 1000) + 1000)).toString();

                // Create hardcoded user & bucket user into a flag variation
                const user = optimizely.createUserContext(userId);

                // Create event properties
                const properties = { 
                    "Category": random_item(items_category),
                    "Subcategory": random_item(items_subcategory),
                    "Sale Item": random_item(items_saleitem) 
                };

                // Create tags
                const tags = {
                    $opt_event_properties: properties,
                    revenue: getRandomIntInclusive(3000,12000) // $30-$120
                  };
                //console.log('OPTI event properties: ', properties); 
                //console.log('OPTI event tags: ', tags);

                // Corresponds to a flag key in your Optimizely project
                const decision = user.decide('abandoned_cart');
                const variationKey = decision.variationKey;
                console.log('OPTI userid: ', userId, ' assigned to variation ', decision.variationKey);

                // Did decision fail with a critical error?
                if (variationKey === null) {
                    console.log('OPTI decision error: ', decision['reasons']);
                }

                if (decision.enabled) {
                    hasOnFlags = true;
                }

                if (decision.variationKey === "off") {
                    lowEventDispatcher(user, 'completed_purchase'); 
                    lowEventDispatcher(user, 'add_to_cart', tags); 
                    lowEventDispatcher(user, 'checkout_started');
                }
                if (decision.variationKey === "variation_1") {
                    highEventDispatcher(user, 'completed_purchase');
                    highEventDispatcher(user, 'add_to_cart', tags);
                    highEventDispatcher(user, 'checkout_started');
                }
                if (decision.variationKey === "variation_2") {
                    normalEventDispatcher(user, 'completed_purchase');
                    normalEventDispatcher(user, 'add_to_cart', tags);
                    normalEventDispatcher(user, 'checkout_started');
                }
            }

            if (!hasOnFlags) {
                console.log('OPTI Flag off for user ', userId);
            }
        });
    }
});
