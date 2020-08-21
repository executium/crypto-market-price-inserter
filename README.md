# Crypto Market Price Inserter
![Price inserter](https://i.imgur.com/qjXFvy7.png)
The crypto market price inserter is provided by executium as a `plugin`. This plugin allows you to add the javascript CDN 

## Hosted Installation
Simply insert the following code into the foot of your page.
```
```

## Stopping an area from converting to price
If you do not want an area to convert then add `nopriceinsert` in a class. All children of that class will then not convert. For example if you didn't want an entire page to convert you could set it as `<body class="nopriceinsert">` then the entire page would not convert.

## How does it convert?
The conversion happens based on a pre-arranged array. That

```javascript
[{phrase:"Bitcoin",code:"bids-binance-btcusdt",img:'btc'},{phrase:"Ethereum",code:"bids-binance-ethusdt",'img':'eth'}]
```
Ths object is currently not editable. If you have suggestions on what you would like to see included then please let us know so we can consider it. 

## Content Delivery Network
The content delivery network is provided by executium ltd and is subject to change. Images are provided via the network and are subject to change. An example of a `cdn` image link is as follows:

```
https://cdn.executium.com/media/brands/icons/btc.png
https://cdn.executium.com/media/brands/icons/eth.png
https://cdn.executium.com/media/brands/icons/xrp.png
https://cdn.executium.com/media/brands/icons/link.png
```

![bitcoin logo](https://cdn.executium.com/media/brands/icons/btc.png)
![eth logo](https://cdn.executium.com/media/brands/icons/eth.png)
![xrp logo](https://cdn.executium.com/media/brands/icons/xrp.png)
![link logo](https://cdn.executium.com/media/brands/icons/link.png)

## License
MIT License

Copyright (c) 2020 executium ltd

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
