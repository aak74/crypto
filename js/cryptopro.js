CryptoPro = function(options) {

    this.window = window;

    // вы можете использовать любой другой plugin для реализации Promise
    this.q = Promise;

    // плагин движка подписи
    this.cadesplugin = this.window.cadesplugin;

    /**
     * Инициализация плагина
     */
    this.load = function(){
        this.oCerts = null;
        this.oStore = null;
        this.oSigner = null;
        this.oSignedData = null;
    };

    this.verify = function(sSignedMessage, oHashedData) {

        var self = this;

        return self.cadesplugin.CreateObjectAsync('CAdESCOM.CadesSignedData')
            .then(function(oSignedData){
                self.oSignedData = oSignedData;
                return self.oSignedData.VerifyHash(oHashedData, sSignedMessage, self.CADESCOM_CADES_BES);
            })
            .then(function(result){
                console.log(result);
                return result;
            });
    }

    /**
     * Подписываем файл выбранным сертификатом
     * @param cert
     * @param data
     * @returns {*}
     */
    this.signCreate = function(cert, data) {

        var self = this;

        return self.cadesplugin.CreateObjectAsync("CAPICOM.Store")
            .then(function(oStore){
                self.oStore = oStore;
                self.oStore.Open(self.cadesplugin.CAPICOM_CURRENT_USER_STORE, self.cadesplugin.CAPICOM_MY_STORE, self.cadesplugin.CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED);
                return self.oStore.Certificates;
            })
            .then(function(oCerts){
                self.oCerts = oCerts;
                return self.oCerts.Find(self.cadesplugin.CAPICOM_CERTIFICATE_FIND_SUBJECT_NAME, cert)
                    .then(function(certs){
                        self.oCerts = certs;
                        return certs.Count;
                    })
                    .then(function(count){
                        if (count < 1) {
                            return self.q.reject('Сертификат не найден');
                        }
                        return self.oCerts.Item(1);
                    });
            })
            .then(function(cert){

                return self.cadesplugin.CreateObjectAsync('CAdESCOM.CPSigner')
                    .then(function(oSigner){
                        self.oSigner = oSigner;
                        return self.oSigner.propset_Certificate(cert);
                    })
                    .then(function(){
                        return self.cadesplugin.CreateObjectAsync('CAdESCOM.CadesSignedData');
                    })
                    .then(function(oSignedData){
                        self.oSignedData = oSignedData;
                        return self.oSignedData.propset_ContentEncoding(self.cadesplugin.CADESCOM_BASE64_TO_BINARY);
                    })
                    .then(function(){
                        return self.oSignedData.propset_Content(data);
                    })
                    .then(function(){
                        return self.oSignedData.SignCades(self.oSigner, self.cadesplugin.CADESCOM_CADES_BES)
                    })
                    .then(function(signature){
                        console.log(signature);
                        self.oStore.Close();
                        return signature;
                    })
            });
    };


    /**
     * Получение списка сертификатов
     * @returns {*}
     */
    this.getCertsList = function() {

        var self = this;

        return self.window.cadesplugin
            .then(function() {
                return self.window.cadesplugin.CreateObjectAsync("CAPICOM.Store")
                    .then(function(oStore) {
                        self.oStore = oStore;

                        // открываем хранилище
                        self.oStore.Open(
                            self.cadesplugin.CAPICOM_CURRENT_USER_STORE,
                            self.cadesplugin.CAPICOM_MY_STORE,
                            self.cadesplugin.CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED
                        );

                        return self.oStore.Certificates

                            // запрашиваем список сертификатов
                            .then(function (oCerts) {
                                self.oCerts = oCerts;
                                return self.oCerts.Count;

                            })
                            // определяем количество
                            .then(function (count) {

                                // если сертификатов нету
                                if (count === 0) {
                                    return self.q.reject('Сертификаты не найдены');
                                } else {
                                    return self.q.resolve(count);
                                }

                            })
                    })

                    // формируем список сертификатов
                    .then(function(count){

                        // Теукщая дата для влидации сертификата
                        var nowDate = new Date();
                        var promises = [];

                        for (let i = 1; i <= count; i++) {

                            let cert = {
                                _id: i,
                                _instance: null,
                                _valid: null,
                                _date: null,
                                _info: []
                            };

                            promises.push(
                                self.oCerts.Item(i)

                                    // получаем сам сертификат
                                    .then(function (oCert) {
                                        cert._instance = oCert;
                                        return cert._instance.ValidToDate;
                                    })

                                    // получаем дату истечения срока выдачи
                                    .then(function (date) {
                                        cert._date = new Date(date);

                                        return cert._instance.IsValid()
                                            .then(function (validator) {
                                                return validator.Result;
                                            });
                                    })

                                    // проверяем валидный ли он
                                    .then(function (isValid) {
                                        cert._valid = isValid;
                                        return cert._instance.HasPrivateKey();
                                    })

                                    // Проверяем КЭП ли это
                                    .then(function (hasPrivateKey) {
                                        if (hasPrivateKey && cert._valid && nowDate < cert._date) {
                                            return cert._instance.SubjectName;
                                        }
                                    })

                                    // берем данные о владельце
                                    .then(function (subjectName){
                                        var arr = subjectName.split(',');
                                        for (var a in arr) {
                                            var info = arr[a].trim().split('=');
                                            cert._info[info[0]] = info[1].trim();
                                        }

                                        return cert;
                                    })
                            );
                        }

                        return self.q.all(promises);
                    })
                    .then(function(list){
                        self.oStore.Close();
                        return self.q.resolve(list);
                    });
            });
    };

    this.load();
};