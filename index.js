const express = require('express');
const { createSignature, verifySignature, transformResponsePayload } = require('./utils');
const axios = require('axios');

const app = express();

//set port
app.set('port', 3000);

//middleware
app.use(express.json());

app.post('/transform', async (req, res) => {
    try {
        const responseToSend = [];
        const payload = req.body;
        //map through each request
        const responses = await Promise.all(payload.map(async (item) => {
            const transformed = {
                account: {
                    currency: item.FL_CURRENCY,
                    amount: item.FL_AMOUNT,
                }
            };
            //sign payload
            const payloadSignature = createSignature(transformed, process.env.PRIVATE_KEY);
            const url = `https://endpoint.dev/api/${item.FL_ACCOUNT}?signature=${payloadSignature}`;
            console.log("signature: ", payloadSignature);
            
            //call endpoint
            const response = await axios.post(url, {transformed}, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            console.log("response: ", response);
            
            if (!response || !response.accountId || !response.transactions || !response.signature) {
                return res.status(403).send({ error: 'Response not valid.' });
            }
        
            //get transformed response
            const transformedResponse = transformResponsePayload(response, item.FL_CURRENCY);
            
            const responseData = {
                account: {
                    currency: transformedResponse.FIN_CURRENCY,
                    amount: transformedResponse.FIN_CREDIT + transformedResponse.FIN_DEBIT,
                }
            }

            const responseString = JSON.stringify(responseData);

            //verify signature
            const isValid = verifySignature(response, responseString, process.env.PUBLIC_KEY);
            if (isValid) {
                //push response to array
                return transformedResponse;
            } else {
                return res.status(403).send({ error: 'Signature is not valid. Please try again. '});
            }
        }));

        //send payload
        console.log("response: ", responses);
        res.status(200).send(responses);
    } catch(error) {
        // console.error('An error has occured: ', error);
        res.status(500).json({ error });
    }
});


//start server
const server = app.listen(app.get('port'), () => {
    console.log(`Started server on port ${app.get('port')}`);
});