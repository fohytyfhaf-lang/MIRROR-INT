export const SettingsPages = {

language: `
<div class="settingsCard">

<h2>🌐 <span data-lang="settings.language"></span></h2>

<p data-lang="settings.language.description"></p>

<div class="settingsRow">

<label for="languageSelect" data-lang="settings.language"></label>

<select id="languageSelect">
<option value="en">English</option>
<option value="ru">Русский</option>
<option value="ua">Українська</option>
</select>

</div>

<button id="saveLanguage" data-lang="buttons.apply"></button>

</div>
`,

appearance: `
<div class="settingsCard">

<h2>🎨 <span data-lang="settings.appearance"></span></h2>

<p data-lang="settings.appearance.description"></p>

<div class="settingsRow">
<label data-lang="settings.animations"></label>
<input id="animations" type="checkbox">
</div>

<div class="settingsRow">
<label data-lang="settings.crt"></label>
<input id="crt" type="checkbox">
</div>

<div class="settingsRow">
<label data-lang="settings.scanlines"></label>
<input id="scanlines" type="checkbox">
</div>

<div class="settingsRow">
<label data-lang="settings.glitchEffects"></label>
<input id="glitchEffects" type="checkbox">
</div>

</div>
`,

audio: `
<div class="settingsCard">

<h2>🔊 <span data-lang="settings.audio"></span></h2>

<p data-lang="settings.audio.description"></p>

<div class="settingsRow">
<label data-lang="settings.masterVolume"></label>
<input id="masterVolume" type="range" min="0" max="100" value="70">
</div>

<div class="settingsRow">
<label data-lang="settings.musicVolume"></label>
<input id="musicVolume" type="range" min="0" max="100" value="70">
</div>

<div class="settingsRow">
<label data-lang="settings.effectsVolume"></label>
<input id="effectsVolume" type="range" min="0" max="100" value="70">
</div>

</div>
`,

interface: `
<div class="settingsCard">

<h2>🖥 <span data-lang="settings.interface"></span></h2>

<p data-lang="settings.interface.description"></p>

<div class="settingsRow">
<label data-lang="settings.uiScale"></label>
<input id="uiScale" type="range" min="80" max="140" value="100">
</div>

<div class="settingsRow">
<label data-lang="settings.fontSize"></label>
<input id="fontSize" type="range" min="12" max="24" value="16">
</div>

</div>
`,

security: `
<div class="settingsCard">

<h2>🔒 <span data-lang="settings.security"></span></h2>

<p data-lang="settings.security.description"></p>

<div class="settingsRow">
<label data-lang="settings.rememberUser"></label>
<input id="rememberUser" type="checkbox">
</div>

<div class="settingsRow">
<label data-lang="settings.autoLogin"></label>
<input id="autoLogin" type="checkbox">
</div>

<button id="clearData" data-lang="buttons.clearData"></button>

</div>
`,

system: `
<div class="settingsCard">

<h2>💾 <span data-lang="settings.system"></span></h2>

<p><strong>Version:</strong> OMEGA DEV 0.2</p>
<p><strong>Status:</strong> <span data-lang="status.online"></span></p>
<p><strong>Environment:</strong> Browser</p>
<p><strong>Storage:</strong> Local Storage</p>

</div>
`,

about: `
<div class="settingsCard">

<h2>ℹ <span data-lang="settings.about"></span></h2>

<p><strong>OMEGA SYSTEM</strong></p>

<p>Mirror Intelligence Research Organization</p>

<p>Development Build</p>

<p>Version 0.2</p>

</div>
`

};
