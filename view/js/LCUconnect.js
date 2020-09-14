//lcuapi
/*
简  简  单  单
的LCU连接器
*/

var LCUrq = function () {
    this.head_protocol;
    this.head_path;
    this.head_url;
    this.head_token;
    this.head_authorization;

    this.install = function (protocol, path, url, token) {
        username = 'riot';
        password = token;
        this.head_authorization = `Basic ${btoa(`${username}:${password}`)}`;

        this.head_protocol = protocol;
        this.head_path = path;
        this.head_url = url;
        this.head_token = token;
    }
    this.request = function (rqurl, method, data, successfunc, errorfunc) {
        //alert(this.head_protocol + "://riot:" + this.head_token + "@" + this.head_url + rqurl);
        var result = {
            url: this.head_protocol + "://riot:" + this.head_token + "@" + this.head_url + rqurl,
            method: method,
            timeout: 0,
            headers: {
                "Content-Type": "application/json"
            },
            data: data,
            error: errorfunc,
            success: successfunc
        }
        return result;
    }

    this.request_getImg = function (imgTag, rqurl) {
        url = this.head_protocol + "://" + this.head_url + rqurl;

        var rq = new XMLHttpRequest();
        rq.open('get', url, true);
        rq.responseType = 'blob'

        rq.setRequestHeader("accept", "*/*");
        rq.setRequestHeader("accept-language", "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7,zh-TW;q=0.6");
        rq.setRequestHeader("authorization", this.head_authorization);

        rq.onreadystatechange = e => {
            if (rq.readyState == XMLHttpRequest.DONE && rq.status == 200) {
                imgTag.src = URL.createObjectURL(rq.response);
                imgTag.onload = () => {
                    //URL.revokeObjectURL(img.src);
                    $(imgTag).css("opacity", 1);
                }
            }
        };

        rq.send(null);
    }
}
