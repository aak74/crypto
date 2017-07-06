<?
file_put_contents(htmlspecialchars($_POST['filename']), htmlspecialchars($_POST['data']));
echo '{"status": "ok"}';
