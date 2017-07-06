var app = function() {

  var certListSelector = '#CertListBox';
  var hashSelector = '.hash';
  var hashJsSelector = '.hash-js';
  var base64Selector = '.base64';
  var signedSelector = '.signed';
  var activeTabSelector = '.tab-pane.active ';
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
        // формируем простой список для выбора сертификата
      var listCert = $(certListSelector).html('');
      for (var i in list) {
        listCert.append('<option value="' + list[i]._info['CN'] + '">' + list[i]._info['CN'] + ' (' + list[i]._date.toLocaleString("ru") + ')' + '</option>');
        // listCert.append('<option value="' + list[i]._id + '">CN: ' + list[i]._info['CN'] + '; Выдан: ' + list[i]._date.toLocaleString("ru") + '</option>');

      }
    });
  }

  var isHash = function() {
    return $(activeTabSelector).attr('id') == 'panel-hash';
  }

  var getHash = function() {
    return new Promise(function(resolve, reject) {
      var url = isHash() ? '/getHash.php' : 'getBase64.php';
      $.get(url)
        .done(function(response) {
          console.log('getHash response', response);
          $(activeTabSelector + hashSelector).text(response);
          resolve(response);
        })
        .fail(function(error) {
          console.error('getHash error', error);
          $(activeTabSelector + hashSelector).text('ERROR');
          reject(error);
        });
    });
  }

  var getHashClient = function() {
    return new Promise(function(resolve, reject) {
      $.get("/getBase64.php")
        .done(function(response) {
          console.log('getBase64 response', response);
          $(activeTabSelector + base64Selector).text(response);
          cryptoPro.getHash(response).then(function(hash) {
            resolve(hash);
          });
        })
        .fail(function(error) {
          console.error('getHashClient error', error);
          reject(error);
        });
    });
  }

  var updateSignature = function(signHash, filename) {
    $.post("/updateSignature.php", {data: signHash, filename: filename})
      .done(function(response) {
        console.log('updateSignature response', response);
        // resolve(response);
        $(activeTabSelector + '.link-to-file').removeClass('hidden');
      })
      .fail(function(error) {
        console.error('updateSignature error', error);
        // reject(error);
      });
  }

  var post = function(url, params, signFilename, processData) {
    return new Promise(function(resolve, reject) {
      console.log('post', url, params, signFilename, processData);
      var certSubject = getCert();
      if (!certSubject) {
        reject('Выберите сертификат');
        return;
      }
      $.post(url, params)
        .done(function(response) {
          console.log('submitted response', response);
          try {
            var result = JSON.parse(response);
          } catch (e) {
            reject('Ошибка парсинга ответа сервера');
            return;
          }
          if (result.status !== 'ok') {
            reject('Ошибка обработки файла на сервере');
            return;
          }
          resolve(result.hash);
        })
        .fail(function(error) {
          reject(error);
        });
    });
  }


  var postFile = function(url, params) {
    return new Promise(function(resolve, reject) {
      console.log('postFile', url, params);
      $.ajax(
        {
          url: url,
          type: 'POST',
          // dataType: 'json',
          processData: false,
          contentType: false,
          // async: false,
          data: params
        })
        .done(function(response) {
          console.log('submitted response', response);
          try {
            var result = JSON.parse(response);
          } catch (e) {
            reject('Ошибка парсинга ответа сервера');
            return;
          }
          if (result.status !== 'ok') {
            reject('Ошибка обработки файла на сервере');
            return;
          }
          var hash = result.hash;
          resolve(hash);
        })
        .fail(function(error) {
          reject(error);
        });
    });
  }

  var sign = function(certSubject, hash, signFilename) {
    cryptoPro.signHash(certSubject, hash)
      .then(function(signature) {
        updateSignature(signature, signFilename);
      })
      .catch(function(error) {
        console.error('sign error', error);
      });
    console.log('submitted', $(this).closest('form').serialize());
  }

  var getCert = function() {
    return $(certListSelector).val();
  }

  var init = function() {
    $('#get-hash').click(function() {
      getHash().then(function(hash) {
        // console.log('hash', hash, $(hashSelector));
        $(activeTabSelector + hashSelector).val(hash);
      });

      getHashClient().then(function(hash) {
        console.log('hash-js', hash);
        $(activeTabSelector + hashJsSelector).val(hash);
      }).catch(function (error) {
        console.error('getHashClient catch', error);
        $(activeTabSelector + hashJsSelector).val('ERROR');
      });
    });

    $('#sign').click(function() {
      var certSubject = getCert();
      if (!certSubject) {
        alert('Выберите сертификат!');
        return false;
      }
      getHash().then(function(hash) {
        if (isHash()) {
          cryptoPro.signHash(certSubject, hash).then(function(signature) {
            $(activeTabSelector + signedSelector).text(signature);
            updateSignature(signature, './download/data.xml.sig');
          });
        } else {
          cryptoPro.signData(certSubject, hash).then(function(signature) {
            $(activeTabSelector + signedSelector).text(signature);
            updateSignature(signature, './download/data.xml.sig');
          });
        }

      });
    });

    $('#submit').click(function() {
      var certSubject = getCert();
      if (!certSubject) {
        alert('Выберите сертификат');
        return;
      }
      post('./postForm.php', {data: $(this).closest('form').serialize()})
        .then(function(hash) {
          alert('Готово. Можете скачать файлы');
          $(activeTabSelector + '.link-to-file').removeClass('hidden');
          $(activeTabSelector + '.link-to-sign').removeClass('hidden');
          sign(certSubject, hash, './download/form-data.xml.sig');
        })
        .catch(function(errorMsg) {
          alert(errorMsg);
        });

    });

    $('#submit-file').click(function() {
      var certSubject = getCert();
      if (!certSubject) {
        alert('Выберите сертификат');
        return;
      }
      var form = $(this).closest('form')[0];
      var formData = new FormData($(form).get(0));
      // formData.append('file', form);
      console.log('file', form, formData, $(form).get(0));
      postFile('./postFile.php', formData)
      // postFile('./postFile.php', {data: formData})
        .then(function(hash) {
          alert('Готово. Можете скачать файлы');
          $(activeTabSelector + '.link-to-file').removeClass('hidden');
          $(activeTabSelector + '.link-to-sign').removeClass('hidden');
          sign(certSubject, hash, './download/form-file.in.sig');
        })
        .catch(function(errorMsg) {
          alert(errorMsg);
        });
    });

    getCerts();
  }

  return {
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
