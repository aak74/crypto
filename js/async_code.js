function CertificateAdjuster(){}

CertificateAdjuster.prototype.extract = function(from, what)
{
    certName = "";

    var begin = from.indexOf(what);

    if(begin>=0)
    {
        var end = from.indexOf(', ', begin);
        certName = (end<0) ? from.substr(begin) : from.substr(begin, end - begin);
    }

    return certName;
}
CertificateAdjuster.prototype.Print2Digit = function(digit){return (digit<10) ? "0"+digit : digit;}
CertificateAdjuster.prototype.GetCertDate = function(paramDate)
{
    var certDate = new Date(paramDate);
    return this.Print2Digit(certDate.getUTCDate())+"."+this.Print2Digit(certDate.getMonth()+1)+"."+certDate.getFullYear() + " " +
             this.Print2Digit(certDate.getUTCHours()) + ":" + this.Print2Digit(certDate.getUTCMinutes()) + ":" + this.Print2Digit(certDate.getUTCSeconds());
}
CertificateAdjuster.prototype.GetCertName = function(certSubjectName){return this.extract(certSubjectName, 'CN=');}
CertificateAdjuster.prototype.GetIssuer = function(certIssuerName){return this.extract(certIssuerName, 'CN=');}
CertificateAdjuster.prototype.GetCertInfoString = function(certSubjectName, certFromDate){return this.extract(certSubjectName,'CN=') + "; Выдан: " + this.GetCertDate(certFromDate);}

function CheckForPlugIn_Async(id) {
    function VersionCompare_Async(StringVersion, ObjectVersion)
    {
        if(typeof(ObjectVersion) == "string")
            return -1;
        var arr = StringVersion.split('.');
        var isActualVersion = true;

        cadesplugin.async_spawn(function *() {
            if((yield ObjectVersion.MajorVersion) == parseInt(arr[0]))
            {
                if((yield ObjectVersion.MinorVersion) == parseInt(arr[1]))
                {
                    if((yield ObjectVersion.BuildVersion) == parseInt(arr[2]))
                    {
                        isActualVersion = true;
                    }
                    else if((yield ObjectVersion.BuildVersion) < parseInt(arr[2]))
                    {
                        isActualVersion = false;
                    }
                }else if((yield ObjectVersion.MinorVersion) < parseInt(arr[1]))
                {
                    isActualVersion = false;
                }
            }else if((yield ObjectVersion.MajorVersion) < parseInt(arr[0]))
            {
                isActualVersion = false;
            }

            if(!isActualVersion)
            {
                document.getElementById('PluginEnabledImg').setAttribute("src", "img/yellow_dot.png");
                document.getElementById('PluginEnabledTxt').innerHTML = "Плагин загружен, но есть более свежая версия.";
            }
/*
            document.getElementById('PlugInVersionTxt').innerHTML = "Версия плагина: " + (yield CurrentPluginVersion.toString());
            var oAbout = yield cadesplugin.CreateObjectAsync("CAdESCOM.About");
            var ver = yield oAbout.CSPVersion("", 75);
            var ret = (yield ver.MajorVersion) + "." + (yield ver.MinorVersion) + "." + (yield ver.BuildVersion);
            document.getElementById('CSPVersionTxt').innerHTML = "Версия CSP: " + ret;
*/
            return;
        });
    }

    function GetLatestVersion_Async(CurrentPluginVersion) {
		$.ajax(
		{
			url: '//cryptopro.ru/sites/default/files/products/cades/latest_2_0.txt',
			success: function(r) {
                PluginBaseVersion = r;
                VersionCompare_Async(PluginBaseVersion, CurrentPluginVersion) 
			}
		});
    }

    document.getElementById('PluginEnabledImg').setAttribute("src", "img/green_dot.png");
    document.getElementById('PluginEnabledTxt').innerHTML = "Плагин загружен.";
    var CurrentPluginVersion;
    cadesplugin.async_spawn(function *() {
        var oAbout = yield cadesplugin.CreateObjectAsync("CAdESCOM.About");
        CurrentPluginVersion = yield oAbout.PluginVersion;
        GetLatestVersion_Async(CurrentPluginVersion);
        FillCertList_Async(id);
    }); //cadesplugin.async_spawn
}

function FillCertList_Async(lstId) {
    cadesplugin.async_spawn(function *() {
		try {
			var oStore = yield cadesplugin.CreateObjectAsync("CAdESCOM.Store");
		}
		catch (ex) {
		    document.getElementById('PluginEnabledImg').setAttribute("src", "img/yellow_dot.png");
		    document.getElementById('PluginEnabledTxt').innerHTML = "Плагин загружен, но отключен в браузере.";
			return;
		}

        try {
            yield oStore.Open();
        }
        catch (ex) {
            alert("Ошибка при открытии хранилища: " + GetErrorMessage(ex));
            return;
        }

        var lst = document.getElementById(lstId);
        if(!lst)
        {
            return;
        }
        var certCnt;
        var certs;

        try {
            certs = yield oStore.Certificates;
            certCnt = yield certs.Count;
        }
        catch (ex) {
            var errormes = document.getElementById("boxdiv").style.display = '';
            return;
        }

        if(certCnt == 0)
        {
            var errormes = document.getElementById("boxdiv").style.display = '';
            return;
        }
       
        for (var i = 1; i <= certCnt; i++) {
            var cert;
            try {
                cert = yield certs.Item(i);
            }
            catch (ex) {
                alert("Ошибка при перечислении сертификатов: " + GetErrorMessage(ex));
                return;
            }

            var oOpt = document.createElement("OPTION");
            var dateObj = new Date();
            try {
                var ValidToDate = new Date((yield cert.ValidToDate));
                var ValidFromDate = new Date((yield cert.ValidFromDate));
                var Validator = yield cert.IsValid();
                var IsValid = yield Validator.Result;
                if(dateObj< ValidToDate && (yield cert.HasPrivateKey()) && IsValid) {
                    oOpt.text = new CertificateAdjuster().GetCertInfoString(yield cert.SubjectName, ValidFromDate);
                }
                else {
                    continue;
                }
            }
            catch (ex) {
                alert("Ошибка при получении свойства SubjectName: " + GetErrorMessage(ex));
            }
            try {
                oOpt.value = yield cert.Thumbprint;
            }
            catch (ex) {
                alert("Ошибка при получении свойства Thumbprint: " + GetErrorMessage(ex));
            }

            lst.options.add(oOpt);
        }

        yield oStore.Close();
    });//cadesplugin.async_spawn
}

function GetCertificate_Async(certListBoxId) {
	return new Promise(function(resolve, reject){
	    cadesplugin.async_spawn(function*(args) {
	        var e = document.getElementById(args[0]);
	        var selectedCertID = e.selectedIndex;
	        if (selectedCertID == -1) {
	            args[2]("Select certificate");
	            return;
	        }

	        var thumbprint = e.options[selectedCertID].value.split(" ").reverse().join("").replace(/\s/g, "").toUpperCase();
	        try {
	            var oStore = yield cadesplugin.CreateObjectAsync("CAdESCOM.Store");
	            yield oStore.Open();
	        } catch (err) {
	            args[2]('Failed to create CAdESCOM.Store: ' + err.number);
	            return;
	        }

	        var CAPICOM_CERTIFICATE_FIND_SHA1_HASH = 0;
	        var all_certs = yield oStore.Certificates;
	        var oCerts = yield all_certs.Find(CAPICOM_CERTIFICATE_FIND_SHA1_HASH, thumbprint);

	        if ((yield oCerts.Count) == 0) {
	            args[2]("Certificate not found");
	            return;
	        }
	        var oCert = yield oCerts.Item(1);
			if (typeof(oCert) == 'undefined') return;
			var sCert = yield oCert.Export(0);
			args[1]([oCert, sCert]);
	    }, certListBoxId, resolve, reject); //cadesplugin.async_spawn
    });
}

function SignHash_Async(oCert, hash) {
	return new Promise(function(resolve, reject){
		cadesplugin.async_spawn(function *(args) {
		    try {    
		        var oHashedData = yield cadesplugin.CreateObjectAsync("CAdESCOM.HashedData");
		        yield oHashedData.propset_Algorithm(100);
		        yield oHashedData.SetHashValue(hash);

				var oSigner = yield cadesplugin.CreateObjectAsync("CAdESCOM.CPSigner");
				yield oSigner.propset_Certificate(oCert)
				var oSignedData = yield cadesplugin.CreateObjectAsync("CAdESCOM.CadesSignedData");
				var sSignedMessage = yield oSignedData.SignHash(oHashedData, oSigner, 1/*CADESCOM_CADES_BES*/);
		        args[2](sSignedMessage);
		    }
		    catch (err)
		    {
		        args[3]("Failed to create signature. Error: " + GetErrorMessage(err));
		    }
		}, oCert, hash, resolve, reject);
	});
}

function Hash_Async(oCert, data) {
	return new Promise(function(resolve, reject){
		cadesplugin.async_spawn(function *(args) {
		    try {    
		        var oHashedData = yield cadesplugin.CreateObjectAsync("CAdESCOM.HashedData");
		        yield oHashedData.propset_Algorithm(100);
		        yield oHashedData.propset_DataEncoding(1);
		        yield oHashedData.Hash(data);
				var sHashValue = yield oHashedData.Value;

//		        var sSignedHash = yield oRawSignature.SignHash(oHashedData, oCert);

		        args[2](sHashValue);
		    }
		    catch (err)
		    {
		        args[3]("Failed to create signature. Error: " + GetErrorMessage(err));
		    }
		}, oCert, data, resolve, reject);
	});
}

function isIE() {
    var retVal = (("Microsoft Internet Explorer" == navigator.appName) || // IE < 11
        navigator.userAgent.match(/Trident\/./i)); // IE 11
    return retVal;
}

async_resolve();
