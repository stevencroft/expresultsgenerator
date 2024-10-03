const { app } = require('@azure/functions');
const optimizelySdk = require('@optimizely/optimizely-sdk');

app.timer('timerTrigger1', {
    //schedule: '0 */5 * * * *',
    schedule: '0 */30 * * * *',
    handler: (myTimer, context) => {
        //context.log('Timer function processed request.');
        
        function getRandomInt(max) {
            return Math.floor(Math.random() * max);
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
            for (let i = 0; i < getRandomInt(20); i++) {
            // to get rapid demo results, generate random users. Each user always sees the same variation unless you reconfigure the flag rule.
            const userId = (Math.floor(Math.random() * (10000 - 1000) + 1000)).toString();

            // Create hardcoded user & bucket user into a flag variation
            const user = optimizely.createUserContext(userId);

            // "product_sort" corresponds to a flag key in your Optimizely project
            const decision = user.decide('abandoned_cart');
            const variationKey = decision.variationKey;
            console.log('OPTI userid: ',userId, ' assigned to variation ', decision.variationKey);

            // did decision fail with a critical error?
            if (variationKey === null) {
            console.log('OPTI decision error: ', decision['reasons']);
            }

            if (decision.enabled) {
                hasOnFlags = true;
               
            }

            // randomise conversion events to generate more interesting results
            eventrandomiser = getRandomInt(3);
            if (eventrandomiser >=1 )  {
                user.trackEvent('purchased');
                console.log('OPTI event dispatched');
            }
            
        }

        if (!hasOnFlags) {
            console.log('Flag was off for everyone');
        }
        });
    context.log('End of block');
    }
});
