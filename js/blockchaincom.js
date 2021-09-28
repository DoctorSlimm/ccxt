'use strict';

//  ---------------------------------------------------------------------------
//	Author: Doctor Slimm
//  ---------------------------------------------------------------------------
const Exchange = require ('./base/Exchange');
const { ExchangeError, InsufficientFunds, BadRequest, BadSymbol, InvalidOrder, AuthenticationError, ArgumentsRequired, OrderNotFound, ExchangeNotAvailable } = require ('./base/errors');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class blockchaincom extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'blockchaincom',
            'name': 'blockchain.com',
            //  'countries': [--],
            'rateLimit': 10000, //  1 request every 10 seconds
            'version': 'v3',
            // new metainfo interface
            'has': {
                'cancelAllOrders': false,
                'cancelOrder': false,
                'createOrder': false,
                'editOrder': false,
                'fetchBalance': false,
                'fetchClosedOrders': false,
                'fetchDepositAddress': false,
                'fetchCurrencies': false,
                'fetchLedger': false,
                'fetchMarkets': true, // trying
                'fetchMyTrades': false,
                'fetchOHLCV': false,
                'fetchOpenOrders': false,
                'fetchOrderBook': false,
                'fetchStatus': false,
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchTime': false,
                'fetchTrades': false,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/99450025-3be60a00-2931-11eb-9302-f4fd8d8589aa.jpg',
                'test': {
                    'public': 'https://testnet-api.delta.exchange',
                    'private': 'https://testnet-api.delta.exchange',
                },
                'api': {
                    'public': 'https://api.blockchain.com/v3/exchange',
                    'private': 'https://api.blockchain.com/v3/exchange',
                },
                'www': 'https://blockchain.com',
                'doc': [
                    'https://api.blockchain.com/v3',
                ],
                'fees': 'https://exchange.blockchain.com/fees',
            },
            'api': {
                'public': {
                    'get': [
                        'tickers',
                        'tickers/{symbol}',
                        'symbols',
                        'symbols/{symbol}',
                        'l2/{symbol}',
                        'l3/{symbol}',
                    ],
                },
                'private': {
                    'get': [
                        'fees',
                        'orders',
                        'orders/{orderId}',
                        'trades',
                        'fills',
                    ],
                    'post': [
                        'orders',
                    ],
                    'delete': [
                        'orders',
                        'orders/{orderId}',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    //  help.. more work to do here
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': false,
            },
            // 'exceptions': { ... 'insufficien_margin': insufficient funds etc errors
        });
    }

    async loadMarkets (reload = false, params = {}) {
        return true;
    }

    async fetchMarkets (params = {}) {
        // fetches a list of all available markets (objects) on the exchange
        // with values such as symbol, base, quote
        const tickers = await this.publicGetTickers ();
        //  const symbols = await this.publicGetSymbols ();
        return tickers;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        //  sign is implemented in fetch2 in Exchange.js
        const requestPath = '/' + this.version + '/' + this.implodeParams (path, params);
        let url = this.urls['api'][api] + requestPath;
        const query = this.omit (params, this.extractParams (path));
        headers = {
            'X-API-KEY': this.apiKey,
        };
        if (api === 'public') {
            //  public api does not have any apikey headers
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (api === 'private') {
            this.checkRequiredCredentials (); //    belongs to Exchange.js
            // add more handling here *************...
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
