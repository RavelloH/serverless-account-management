const baseStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

const base = {
    encryption: function (str) {
        let result = '';
        let i = 0;
        while (i < str.length) {
            let num1 = str.charCodeAt(i++);
            let num2 = str.charCodeAt(i++);
            let num3 = str.charCodeAt(i++);
            const bits = (num1 << 16) | (num2 << 8) | num3;
            const b1 = (bits >> 18) & 0x3f;
            const b2 = (bits >> 12) & 0x3f;
            const b3 = (bits >> 6) & 0x3f;
            const b4 = bits & 0x3f;
            result += baseStr[b1] + baseStr[b2] + baseStr[b3] + baseStr[b4];
        }
        return result;
    },
    decrypt: function (str) {
        let result = '';
        let i = 0;
        while (i < str.length) {
            const b1 = baseStr.indexOf(str[i++]);
            const b2 = baseStr.indexOf(str[i++]);
            const b3 = baseStr.indexOf(str[i++]);
            const b4 = baseStr.indexOf(str[i++]);
            const bits = (b1 << 18) | (b2 << 12) | (b3 << 6) | b4;
            const num1 = (bits >> 16) & 0xff;
            const num2 = (bits >> 8) & 0xff;
            const num3 = bits & 0xff;
            if (b3 === 64) {
                result += String.fromCharCode(num1);
            } else if (b4 === 64) {
                result += String.fromCharCode(num1, num2);
            } else {
                result += String.fromCharCode(num1, num2, num3);
            }
        }
        return result;
    },
};

module.exports = base;