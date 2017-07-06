<?
$result = [
  'status' => 'error'
];
print_r($_POST);
print_r($_FILES);
if (!empty($_POST)) {
    if ( 0 < $_FILES['file']['error'] ) {
        echo 'Error: ' . $_FILES['file']['error'] . '<br>';
    } else {
        move_uploaded_file($_FILES['file']['tmp_name'], 'download/' . $_FILES['file']['name']);
    }
    file_put_contents('./download/form-file.in', $_POST['file']);
    $str = file_get_contents('./download/mountains.jpg');

    require_once('CryptoPro.php');
    $cryptopro = new CryptoPro;
    file_put_contents('./download/mountains.jpg.shs', $cryptopro->getHash($str));
    $result = [
      'hash' => $cryptopro->getHash($str),
      'status' => 'ok'
    ];
}
echo json_encode($result);
