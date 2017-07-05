<?
file_put_contents('./download/data.xml.sig', $_POST['data']);
file_put_contents('./download/data.xml-raw.sig', $_POST['data']);
file_put_contents('./download/data.xml-decoded.sig', base64_decode($_POST['data']));
echo 'updateSignature';
