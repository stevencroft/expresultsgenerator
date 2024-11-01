const { app } = require('@azure/functions');
const optimizelySdk = require('@optimizely/optimizely-sdk');

app.timer('timerTrigger1', {
    //schedule: '0 */5 * * * *', //DEBUG
    schedule: '0 */15 * * * *',
    handler: (myTimer, context) => {
        //context.log('Timer function processed request.');

        function getRandomInt(max) {
            return Math.floor(Math.random() * max);
        }

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
                console.log('OPTI lowevent dispatched ', event, ' ', tags);
            }
        }     
        
        function normalEventDispatcher(user, event, tags)
        //50% chance of sending an event
        {
            eventrandomiser = getRandomInt(10);
            if (eventrandomiser > 5) {
                user.trackEvent(event, tags);
                console.log('OPTI normalevent dispatched', event, ' ', tags);
            }
        }   
        
        function highEventDispatcher(user, event, tags)
        //75% chance of sending an event
        {
            eventrandomiser = getRandomInt(12);
            if (eventrandomiser <= 9) {
                user.trackEvent(event, tags);
                console.log('OPTI highevent dispatched', event, ' ', tags);
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
            //for (let i = 0; i < 1; i++) {
            for (let i = 0; i < getRandomIntInclusive(75, 200); i++) {
                // to get rapid demo results, generate random users. Each user always sees the same variation unless you reconfigure the flag rule.
                const userId = (Math.floor(Math.random() * (10000 - 1000) + 1000)).toString();

                // Create hardcoded user & bucket user into a flag variation
                const user = optimizely.createUserContext(userId);

                // Create tags
                const tags = {
                    revenue: getRandomIntInclusive(3000,12000)
                  };

                // Corresponds to a flag key in your Optimizely project
                const decision = user.decide('abandoned_cart');
                const variationKey = decision.variationKey;
                console.log('OPTI userid: ', userId, ' assigned to variation ', decision.variationKey);

                // did decision fail with a critical error?
                if (variationKey === null) {
                    console.log('OPTI decision error: ', decision['reasons']);
                }

                if (decision.enabled) {
                    hasOnFlags = true;
                }

                if (decision.variationKey === "off") {
                    lowEventDispatcher(user, 'completed_purchase', tags); 
                    lowEventDispatcher(user, 'add_to_cart'); 
                    lowEventDispatcher(user, 'checkout_started');
                }
                if (decision.variationKey === "variation_1") {
                    highEventDispatcher(user, 'completed_purchase', tags);
                    highEventDispatcher(user, 'add_to_cart');
                    highEventDispatcher(user, 'checkout_started');
                }
                if (decision.variationKey === "variation_2") {
                    normalEventDispatcher(user, 'completed_purchase', tags);
                    normalEventDispatcher(user, 'add_to_cart');
                    normalEventDispatcher(user, 'checkout_started');
                }
            //     // randomise conversion events to generate more interesting results
            //     eventrandomiser = getRandomInt(3);
            //     if (eventrandomiser >= 1) {
            //         user.trackEvent('purchase');
            //         console.log('OPTI event dispatched');
            //     }
            }

            if (!hasOnFlags) {
                console.log('OPTI Flag were off for user ', userId);
            }
        });
    }
});
