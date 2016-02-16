(function (Ecli) {
    var url = "https://maxim.databoom.space/api1/bookmarkr/collections/records";

    var RecordReader = function (userid) {
        this.userid = userid;
    };

    RecordReader.prototype = {
        getRecords: function (cb) {
            var request = new XMLHttpRequest();
            request.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                    var data = JSON.parse(this.responseText);
                    var processedData = data.d.results.map(function (record) {
                        return {
                            created: new Date(record.created),
                            link: CryptoJS.TripleDES.decrypt(record.link, "EcliKey_blargh_goats_are_magestic").toString(CryptoJS.enc.Latin1)
                        }
                    });

                    cb && cb(processedData);
                }
            }

            request.open('GET', url);
            request.setRequestHeader('Authorization', 'Basic ' + btoa("ecli" + ":" + "ecli"));
            request.send();
        }
    };

    Ecli.RecordReader = RecordReader;
}(window.Ecli = window.Ecli || {}));