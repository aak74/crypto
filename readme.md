# Пример работы с CryptoPro


## Сервер

### Требования
- PHP 5.6 (На PHP 7 не удалось скомпилировать расширение cades)
- Необходимо установить расширение CryptoPro. Для этого его нужно  сначала скомпилировать.

### Компиляция расширения
[Краткая инструкция](http://cpdn.cryptopro.ru/content/cades/phpcades-install.html)

[Более подробная инструкция](http://pyatilistnik.org/installation-of-crypto-pro-csp-on-centos-7/)
В этой инструкции есть неточность. При установке пакета php-devel не нужно выкачивать исходники PHP.

## Клиент
- Необходимо установить плагин [КриптоПро ЭЦП browser plug-in](https://www.cryptopro.ru/products/cades/plugin), с использованием асинхронных обьектов `cadesplugin.CreateObjectAsync("CAPICOM.Store")`
- [КриптоПро ЦСП 4.0](https://www.cryptopro.ru/products/csp/downloads)
- [КриптоПро browser plug-in 2.0](https://www.cryptopro.ru/products/cades/plugin/get_2_0)
- генерируем [тестовый сертификат](https://www.cryptopro.ru/certsrv/certrqma.asp) и импортируем его в хранилище
- генерируем [сертификат тестового атестационного центра](http://www.cryptopro.ru/certsrv/certnew.cer?ReqID=CACert&Renewal=0&Enc=bin)
- [проверяем работает ли сам плагин](https://www.cryptopro.ru/sites/default/files/products/cades/demopage/simple.html)
- добавляем в `Настройки КриптоПро ЭЦП Browser Plug-in`(для Chrome: chrome-extension://iifchhfnnmpdbibifmljnfjhpififfog/trusted_sites.html) хосты: https://*.cryptopro.ru, http://localhost:8000
- [проверка подписанного документа](https://www.gosuslugi.ru/pgu/eds/)

## Описание работы

### Хэширование

Хэширование можно проверить с помощью утилиты [cpverify](https://www.cryptopro.ru/sites/default/files/public/cpverify/cpverify.exe). Есть версия для Linux.

`cpverify ./data.xml -inverted_halfbytes 0`
