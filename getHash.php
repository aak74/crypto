<?

// echo base64_encode(file_get_contents('./download/data.xml'));
// return;
// // echo base64_encode('Hello World');
require_once('CryptoPro.php');
$cryptopro = new CryptoPro;
$hash = $cryptopro->getHash(file_get_contents('./download/data.xml'));
file_put_contents('./download/data.xml.hsh', $hash);
echo $hash;
