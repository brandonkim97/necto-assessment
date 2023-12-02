const request = require('supertest');
const utils = require('../utils');
const crypto = require('crypto');

jest.mock('crypto');

describe('Utils - createSignature', () => {
    test('should create signature successfully', () => {
        const transformed = {
            account: {
                currency: "USD",
                amount: "500",
            }
        };
        const privateKey = 'mocked-private-key';
        const signUpdateMock = jest.fn();
        const signSignMock = jest.fn(() => 'mocked-signature');
        crypto.createSign.mockImplementation(() => ({
            update: signUpdateMock,
            sign: signSignMock,
        }));

        const signature = utils.createSignature(transformed, privateKey);

        expect(signUpdateMock).toHaveBeenCalledWith(JSON.stringify(transformed));
        expect(signSignMock).toHaveBeenCalledWith('mocked-private-key', 'base64');
        expect(signature).toBe('mocked-signature');
    });
});

describe('Utils- verifySignature', () => {
    test('should verify signature successfully', () => {
        const response = {
            accountId: "123",
            transactions: [
                {
                    id: "1",
                    amount: "500",
                    type: "Debit"
                }
            ],
            signature: 'mocked-signature',
        }
        const responseData = {
            account: {
                currency: "USD",
                amount: "500",
            }
        }
        const transactions = JSON.stringify(responseData);
        const publicKey = 'mocked-public-key';

        const verifyUpdateMock = jest.fn();
        const verifyVerifyMock = jest.fn(() => true);
        crypto.createVerify.mockImplementation(() => ({
            update: verifyUpdateMock,
            verify: verifyVerifyMock,
        }));

        const isValid = utils.verifySignature(response, transactions, publicKey);

        expect(verifyUpdateMock).toHaveBeenCalledWith(transactions);
        expect(verifyVerifyMock).toHaveBeenCalledWith('mocked-public-key', 'mocked-signature', 'base64');
        expect(isValid).toBe(true);
    });
});

describe('Utils - getSumByType', () => {
    test('should calculate sum correctly for given type', () => {
        const transactions = [
            {
                id: "1",
                amount: 500,
                type: "Debit"
            },
            {
                id: "2",
                amount: 200,
                type: "Credit"
            },
            {
                id: "3",
                amount: 350,
                type: "Debit"
            },
        ];

        const type = "Debit";
        const sum = utils.getSumByType(transactions, type);
        console.log("sum:", sum)
        expect(sum).toBe(850);
    });
});