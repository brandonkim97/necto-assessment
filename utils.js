require('dotenv').config();
const crypto = require('crypto');


const createSignature = (transformed, key) => {
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(JSON.stringify(transformed));
    const signature = sign.sign(key, 'base64');
    return signature;
}

const verifySignature = (response, transactions, key) => {
    const verifySignature = crypto.createVerify('RSA-SHA256');
    verifySignature.update(transactions);
    const isValid = verifySignature.verify(key, response.signature, 'base64');
    return isValid;
}

const transformResponsePayload = (response, currency) => {
    const creditSum = getSumByType(response.transactions, "Credit");
    const debitSum = getSumByType(response.transactions, "Debit");
    return {
        FIN_ACCOUNT: response.accountId,
        FIN_CURRENCY: currency,
        FIN_DEBIT: debitSum,
        FIN_CREDIT: creditSum,
    }
}   

const getSumByType = (transactions, type) => {
    return transactions.reduce((total, transaction) => {
        if (transaction.type === type) {
            total += transaction.amount;
        }
        return total;
    }, 0);
}

module.exports = {
    createSignature,
    verifySignature,
    transformResponsePayload,
    getSumByType
}