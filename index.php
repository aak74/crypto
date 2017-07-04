<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<link rel="stylesheet" href="css/app.css">
	<script src="js/jquery.js"></script>
	<script src="js/es6.js"></script>
	<script src="js/ie_eventlistner_polyfill.js"></script>
	<script src="js/cadesplugin_api.js"></script>
</head>
<body>
	<div class="content">
		<img id="PluginEnabledImg">
		<span id="PluginEnabledTxt"></span>
		<div class="row clearfix">
			<div class="name">
				Выберите сертификат:
			</div>
			<div class="value">
				<select size="4" name="CertListBox" id="CertListBox" style="width:300px;resize:none;border:0;"></select>
			</div>
		</div>
		<div class="row clearfix">
			<div class="name">&nbsp;
			</div>
			<div class="value">
				<input type="button" id="get-hash" value="Получить хэш"/>
			</div>
		</div>
		<div class="row clearfix">
			<div class="name">
				Hash server:
			</div>
			<div class="value">
				<textarea id="hash" rows="1" cols="80"></textarea>
			</div>
		</div>
		<div class="row clearfix">
			<div class="name">
				Hash client:
			</div>
			<div class="value">
				<textarea id="hash-js" rows="1" cols="80"></textarea>
			</div>
		</div>
		<div class="row clearfix">
			<div class="name">&nbsp;
			</div>
			<div class="value">
				<input type="button" id="sign" value="Подписать"/>
			</div>
		</div>
		<div class="row clearfix">
			<div class="name">
				Base64:
			</div>
			<div class="value">
				<textarea id="base64" rows="10" cols="80">
				</textarea>
			</div>
		</div>
		<div class="row clearfix">
			<div class="name">
				Sign:
			</div>
			<div class="value">
				<textarea id="signed" rows="30" cols="80">
				</textarea>
			</div>
		</div>
	</div>
	<script src="js/cryptopro.js"></script>
	<script src="js/app.js"></script>
</body>
</html>
