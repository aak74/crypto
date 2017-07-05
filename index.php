<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>CryptoPro Example</title>
		<link rel="stylesheet" href="css/bootstrap.min.css">
		<link rel="stylesheet" href="css/app.css">
  </head>
<body>
  <div class="container-fluid">
		<div class="row clearfix">
		  <div class="name">
		    Выберите сертификат:
		  </div>
		  <div class="value">
		    <select size="4" name="CertListBox" id="CertListBox" style="width:300px;resize:none;border:0;"></select>
		  </div>
		</div>
		<div class="row">
			<div class="col-md-12">
				<div class="tabbable" id="tabs">
					<ul class="nav nav-tabs">
						<li class="active">
							<a href="#panel-hash" data-toggle="tab">Hash</a>
						</li>
						<li>
							<a href="#panel-file" data-toggle="tab">File</a>
						</li>
					</ul>
					<div class="tab-content">
						<div role="tabpanel" class="tab-pane active" id="panel-hash">
							<?include('./pages/hash.php');?>
						</div>
						<div role="tabpanel" class="tab-pane" id="panel-file">
							<?include('./pages/file.php');?>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
  <script src="js/jquery.min.js"></script>
	<script src="js/bootstrap.min.js"></script>
	<script src="js/es6.js"></script>
	<script src="js/ie_eventlistner_polyfill.js"></script>
	<script src="js/cadesplugin_api.js"></script>
	<script src="js/cryptopro.js"></script>
	<script src="js/app.js"></script>
</body>
</html>
