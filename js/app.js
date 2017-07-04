var app = function() {

  var certListSelector = '#CertListBox';
  var hashSelector = '#hash';
  var signedSelector = '#signed';
  var getCerts = function() {
    /**
     * получаем массив сертификатов в виде:
     * [
     *  {
     *      _id: integer,    # идентификатор сертификата в CAPICOM.Store.Certificates
     *      _instance: {},   # обьект CAPICOM.Store.Certificates
     *      _valid: boolean, # действителен ли сертификат по дате завершения его действия
     *      _date: Date,     # дата окончания действия сертификата
     *      _info: [...]     # информация о владельце (CN - фио владельца...)
     *  },
     *  ...
     * ]
     */
    cryptoPro.getCertsList().then(function(list) {
      console.log('list', list);
        // формируем простой список для выбора сертификата
      var listCert = $(certListSelector).html('');
      for (var i in list) {
        console.log('i', i, list[i]);
        listCert.append('<option value="' + list[i]._info['CN'] + '">' + list[i]._info['CN'] + ' (' + list[i]._date.toLocaleString("ru") + ')' + '</option>');
        // listCert.append('<option value="' + list[i]._id + '">CN: ' + list[i]._info['CN'] + '; Выдан: ' + list[i]._date.toLocaleString("ru") + '</option>');

      }
    });
  }

  var getHash = function() {
    return new Promise(function(resolve, reject) {
      $.get("/getHash.php")
        .done(function(response) {
          console.log('getHash response', response);
          $('#hash').text(response);
          resolve(response);
        })
        .fail(function(error) {
          console.error('getHash error', error);
          reject(error);
        });
    });
  }

  var updateSignature = function(signHash) {
    return new Promise(function(resolve, reject) {
      $.post("/updateSignature.php", {data: signHash})
        .done(function(response) {
          console.log('updateSignature response', response);
          // $('#hash').text(response);
          resolve(response);
        })
        .fail(function(error) {
          console.error('updateSignature error', error);
          reject(error);
        });
    });
  }

  var init = function() {
    console.log('init');
    $('#get-hash').click(function() {
      console.log('get hash clicked');
      getHash().then(function(hash) {
        console.log('hash', hash);
        $(hashSelector).text(hash);
      });
    });

    $('#sign').click(function() {
      var certSubject = $(certListSelector).val();
      if (!certSubject) {
        alert('Выберите сертификат!');
        return;
      }
      getHash().then(function(hash) {
        console.log('sign hash', certSubject, hash);
        cryptoPro.signCreate(certSubject, hash).then(function(signHash) {
          console.log('sign hash', signHash);
          $(signedSelector).text(signHash);
          updateSignature(signHash);
        });
      });
    });

    getCerts();
  }

  return {
    // getCerts: getCerts,
    // getCertsList: getCertsList,
    init: init,
    sign: sign
  }
}();

$(document).ready(function() {
  window.cryptoPro = new CryptoPro();
  if (!cryptoPro.cadesplugin) {
      alert('Плагин не загружен');
      return;
  }

  app.init();
});
