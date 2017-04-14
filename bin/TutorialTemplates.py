#
#   clip_8 interpreter; iconic language for paper-inspired operations.
#   Copyright (C) 2016, 2017  Martin Brösamle
#
#   This program is free software: you can redistribute it and/or modify
#   it under the terms of the GNU General Public License as published by
#   the Free Software Foundation, either version 3 of the License, or
#   (at your option) any later version.
#
#   This program is distributed in the hope that it will be useful,
#   but WITHOUT ANY WARRANTY; without even the implied warranty of
#   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#   GNU General Public License for more details.
#
#   You should have received a copy of the GNU General Public License
#   along with this program.  If not, see <http://www.gnu.org/licenses/>.
#


import PyBroeModules.MultiTemplateA as MT
from string import Template

from CommonTemplates import *

TOCsection = Template("""
<p>
<b><a href="$tuthref">$tuttitle</a></b> [<a href="$solutionhref">$solutiontitle</a>]
</p>
""")

DependClip8_str = DependClip8_str + """<link rel="stylesheet" href="../css/klippen.css">"""

ScriptInBody_str = """<script src="../js/svgloader.js"></script>"""

KlippenControler_str = """
<p>
<button onclick="Clip8controler.playAction()"  >&#x25B6;           </button>
<button onclick="Clip8controler.pauseAction()" >&#x2759;&#x2759;   </button>
<button onclick="Clip8controler.stepAction()"  >&#x276F;           </button>
<button onclick="handleStop()"                 >&#x25FC;           </button> &nbsp;&nbsp;&nbsp;
<input type="file" id="filechooser" name="files[]"/>
</p>
"""

KlippenInitialSVG_str = """
<p>
<svg id="clip8svgroot" viewBox="0 0 64 64">
<g>
	<g>
		<polyline fill="none" stroke="#FF00A8" stroke-width="2" stroke-miterlimit="10" points="64,58 64,64 58,64 		"/>
			<line fill="none" stroke="#FF00A8" stroke-width="2" stroke-miterlimit="10" stroke-dasharray="10.4,10.4" x1="47.6" y1="64" x2="11.2" y2="64"/>
		<polyline fill="none" stroke="#FF00A8" stroke-width="2" stroke-miterlimit="10" points="6,64 0,64 0,58 		"/>
			<line fill="none" stroke="#FF00A8" stroke-width="2" stroke-miterlimit="10" stroke-dasharray="10.4,10.4" x1="0" y1="47.6" x2="0" y2="11.2"/>
		<polyline fill="none" stroke="#FF00A8" stroke-width="2" stroke-miterlimit="10" points="0,6 0,0 6,0 		"/>
			<line fill="none" stroke="#FF00A8" stroke-width="2" stroke-miterlimit="10" stroke-dasharray="10.4,10.4" x1="16.4" y1="0" x2="52.8" y2="0"/>
		<polyline fill="none" stroke="#FF00A8" stroke-width="2" stroke-miterlimit="10" points="58,0 64,0 64,6 		"/>
			<line fill="none" stroke="#FF00A8" stroke-width="2" stroke-miterlimit="10" stroke-dasharray="10.4,10.4" x1="64" y1="16.4" x2="64" y2="52.8"/>
	</g>
</g>
<g>
	<path fill="#FFF" d="M11.03,25.553v0.497c0.162-0.197,0.336-0.346,0.522-0.445s0.406-0.149,0.659-0.149
		c0.268,0,0.516,0.063,0.743,0.188c0.227,0.126,0.403,0.301,0.527,0.524s0.187,0.459,0.187,0.706c0,0.392-0.14,0.727-0.42,1.004
		c-0.28,0.278-0.625,0.417-1.033,0.417c-0.487,0-0.882-0.198-1.185-0.594v1.643h0.662c0.064,0,0.111,0.012,0.139,0.037
		c0.028,0.024,0.042,0.058,0.042,0.099c0,0.039-0.014,0.071-0.042,0.098c-0.028,0.025-0.075,0.039-0.139,0.039h-1.302
		c-0.065,0-0.111-0.013-0.14-0.037c-0.028-0.025-0.042-0.059-0.042-0.1s0.014-0.074,0.042-0.099c0.028-0.025,0.075-0.037,0.14-0.037
		h0.367V25.83h-0.367c-0.065,0-0.111-0.014-0.14-0.039c-0.028-0.026-0.042-0.06-0.042-0.101c0-0.039,0.014-0.071,0.042-0.098
		c0.028-0.026,0.075-0.039,0.14-0.039H11.03z M13.393,26.875c0-0.314-0.114-0.583-0.342-0.807s-0.507-0.336-0.835-0.336
		c-0.331,0-0.611,0.112-0.841,0.337c-0.229,0.226-0.344,0.494-0.344,0.806c0,0.313,0.114,0.583,0.344,0.808
		c0.229,0.226,0.51,0.338,0.841,0.338c0.327,0,0.604-0.112,0.834-0.336C13.278,27.459,13.393,27.19,13.393,26.875z"/>
	<path fill="#FFF" d="M16.184,24.291v3.801h1.071c0.067,0,0.115,0.013,0.143,0.037c0.028,0.025,0.042,0.058,0.042,0.099
		c0,0.039-0.014,0.072-0.042,0.098c-0.028,0.026-0.076,0.039-0.143,0.039H14.84c-0.065,0-0.111-0.013-0.14-0.039
		c-0.028-0.025-0.042-0.059-0.042-0.098c0-0.041,0.014-0.073,0.042-0.099c0.028-0.024,0.075-0.037,0.14-0.037h1.071v-3.524h-0.785
		c-0.065,0-0.112-0.013-0.141-0.039s-0.044-0.06-0.044-0.101c0-0.039,0.014-0.071,0.042-0.098c0.028-0.025,0.076-0.039,0.143-0.039
		H16.184z"/>
	<path fill="#FFF" d="M21.509,27.024h-2.778c0.047,0.353,0.195,0.636,0.443,0.852c0.248,0.215,0.554,0.323,0.92,0.323
		c0.204,0,0.417-0.034,0.64-0.102c0.223-0.066,0.404-0.155,0.545-0.266c0.041-0.032,0.077-0.049,0.107-0.049
		c0.035,0,0.065,0.014,0.091,0.041c0.026,0.026,0.039,0.059,0.039,0.096c0,0.036-0.017,0.072-0.052,0.106
		c-0.104,0.108-0.288,0.21-0.553,0.304s-0.537,0.142-0.816,0.142c-0.467,0-0.857-0.153-1.17-0.46
		c-0.313-0.306-0.469-0.676-0.469-1.111c0-0.396,0.146-0.735,0.439-1.019c0.293-0.283,0.656-0.426,1.089-0.426
		c0.446,0,0.813,0.146,1.1,0.437C21.372,26.183,21.514,26.56,21.509,27.024z M21.233,26.748c-0.054-0.301-0.196-0.545-0.427-0.733
		s-0.504-0.282-0.823-0.282c-0.318,0-0.592,0.093-0.821,0.279c-0.229,0.186-0.372,0.432-0.429,0.736H21.233z"/>
	<path fill="#FFF" d="M24.806,28.364v-0.393c-0.396,0.333-0.819,0.5-1.269,0.5c-0.327,0-0.582-0.083-0.766-0.249
		c-0.184-0.165-0.276-0.368-0.276-0.608c0-0.264,0.121-0.494,0.363-0.691c0.243-0.196,0.596-0.295,1.062-0.295
		c0.125,0,0.262,0.008,0.409,0.024c0.147,0.017,0.306,0.042,0.477,0.076v-0.441c0-0.149-0.069-0.279-0.208-0.39
		s-0.346-0.165-0.623-0.165c-0.212,0-0.51,0.062-0.893,0.185c-0.069,0.021-0.114,0.033-0.133,0.033
		c-0.035,0-0.064-0.014-0.089-0.039c-0.025-0.026-0.038-0.059-0.038-0.098c0-0.037,0.011-0.066,0.033-0.088
		c0.03-0.032,0.152-0.076,0.367-0.133c0.337-0.091,0.593-0.137,0.766-0.137c0.344,0,0.612,0.085,0.805,0.255
		c0.192,0.17,0.289,0.362,0.289,0.576v1.805h0.364c0.067,0,0.115,0.013,0.143,0.037c0.028,0.025,0.042,0.058,0.042,0.099
		c0,0.039-0.014,0.072-0.042,0.098c-0.028,0.026-0.076,0.039-0.143,0.039H24.806z M24.806,27.007
		c-0.127-0.037-0.263-0.063-0.405-0.081c-0.143-0.018-0.293-0.026-0.451-0.026c-0.396,0-0.706,0.086-0.928,0.257
		c-0.169,0.128-0.253,0.28-0.253,0.457c0,0.165,0.064,0.304,0.193,0.416c0.128,0.112,0.316,0.169,0.563,0.169
		c0.236,0,0.455-0.048,0.657-0.142s0.411-0.244,0.625-0.449V27.007z"/>
	<path fill="#FFF" d="M28.912,25.732c0-0.063,0.013-0.108,0.039-0.137c0.026-0.027,0.059-0.042,0.098-0.042
		c0.041,0,0.075,0.015,0.101,0.042c0.026,0.028,0.039,0.076,0.039,0.144v0.467c0,0.065-0.013,0.111-0.039,0.14
		s-0.06,0.042-0.101,0.042c-0.037,0-0.068-0.012-0.093-0.035c-0.025-0.024-0.04-0.063-0.043-0.117
		c-0.013-0.13-0.08-0.237-0.201-0.321c-0.178-0.121-0.413-0.182-0.705-0.182c-0.305,0-0.542,0.062-0.71,0.185
		c-0.128,0.094-0.191,0.197-0.191,0.312c0,0.13,0.076,0.238,0.227,0.325c0.104,0.061,0.301,0.106,0.59,0.14
		c0.379,0.041,0.642,0.087,0.789,0.139c0.209,0.076,0.366,0.181,0.469,0.315c0.103,0.134,0.154,0.279,0.154,0.435
		c0,0.231-0.112,0.438-0.334,0.618s-0.549,0.271-0.98,0.271s-0.783-0.109-1.058-0.328c0,0.073-0.004,0.121-0.013,0.143
		c-0.009,0.021-0.024,0.04-0.047,0.056c-0.022,0.015-0.048,0.022-0.076,0.022c-0.039,0-0.071-0.014-0.097-0.042
		c-0.026-0.028-0.039-0.075-0.039-0.14v-0.562c0-0.064,0.012-0.111,0.037-0.14s0.058-0.042,0.099-0.042
		c0.039,0,0.072,0.014,0.099,0.04c0.027,0.027,0.041,0.063,0.041,0.109c0,0.1,0.025,0.183,0.075,0.25
		c0.076,0.104,0.196,0.189,0.362,0.258s0.368,0.103,0.608,0.103c0.355,0,0.619-0.066,0.792-0.198
		c0.173-0.132,0.259-0.271,0.259-0.419c0-0.169-0.087-0.304-0.263-0.405c-0.177-0.102-0.436-0.17-0.774-0.205
		c-0.339-0.034-0.582-0.08-0.729-0.136c-0.147-0.057-0.262-0.141-0.344-0.253c-0.082-0.113-0.123-0.234-0.123-0.364
		c0-0.233,0.114-0.419,0.344-0.557c0.229-0.137,0.503-0.206,0.821-0.206C28.37,25.456,28.676,25.548,28.912,25.732z"/>
	<path fill="#FFF" d="M33.475,27.024h-2.778c0.047,0.353,0.195,0.636,0.443,0.852c0.248,0.215,0.554,0.323,0.92,0.323
		c0.204,0,0.417-0.034,0.64-0.102c0.223-0.066,0.404-0.155,0.545-0.266c0.041-0.032,0.077-0.049,0.107-0.049
		c0.034,0,0.064,0.014,0.091,0.041c0.026,0.026,0.039,0.059,0.039,0.096c0,0.036-0.018,0.072-0.052,0.106
		c-0.104,0.108-0.288,0.21-0.554,0.304c-0.265,0.094-0.537,0.142-0.816,0.142c-0.467,0-0.857-0.153-1.17-0.46
		c-0.313-0.306-0.469-0.676-0.469-1.111c0-0.396,0.146-0.735,0.439-1.019c0.293-0.283,0.656-0.426,1.089-0.426
		c0.446,0,0.813,0.146,1.101,0.437S33.479,26.56,33.475,27.024z M33.199,26.748c-0.055-0.301-0.196-0.545-0.427-0.733
		s-0.505-0.282-0.823-0.282c-0.318,0-0.592,0.093-0.821,0.279c-0.229,0.186-0.372,0.432-0.429,0.736H33.199z"/>
	<path fill="#FFF" d="M41.313,24.291v3.801h0.363c0.067,0,0.114,0.013,0.143,0.037c0.028,0.025,0.043,0.058,0.043,0.099
		c0,0.039-0.015,0.072-0.043,0.098c-0.028,0.026-0.075,0.039-0.143,0.039h-0.64v-0.542c-0.315,0.433-0.717,0.649-1.204,0.649
		c-0.246,0-0.482-0.065-0.709-0.196c-0.226-0.131-0.404-0.317-0.535-0.561c-0.131-0.242-0.196-0.492-0.196-0.749
		c0-0.26,0.065-0.511,0.196-0.752s0.31-0.428,0.535-0.56c0.227-0.132,0.464-0.198,0.713-0.198c0.476,0,0.876,0.217,1.2,0.649v-1.538
		h-0.363c-0.066,0-0.114-0.013-0.143-0.039s-0.042-0.06-0.042-0.101c0-0.039,0.014-0.071,0.042-0.098
		c0.028-0.025,0.076-0.039,0.143-0.039H41.313z M41.036,26.965c0-0.347-0.116-0.639-0.351-0.877
		c-0.233-0.237-0.511-0.356-0.834-0.356c-0.324,0-0.604,0.119-0.837,0.356c-0.233,0.238-0.351,0.53-0.351,0.877
		c0,0.344,0.117,0.636,0.351,0.874c0.233,0.239,0.513,0.359,0.837,0.359c0.323,0,0.601-0.12,0.834-0.359
		C40.92,27.601,41.036,27.309,41.036,26.965z"/>
	<path fill="#FFF" d="M43.64,25.553v0.688c0.354-0.32,0.62-0.526,0.797-0.618c0.176-0.093,0.339-0.139,0.488-0.139
		c0.162,0,0.313,0.055,0.452,0.164c0.14,0.109,0.21,0.192,0.21,0.248c0,0.041-0.014,0.075-0.041,0.103
		c-0.026,0.027-0.061,0.041-0.102,0.041c-0.022,0-0.04-0.004-0.056-0.012c-0.015-0.008-0.043-0.032-0.084-0.073
		c-0.076-0.075-0.142-0.128-0.198-0.155c-0.057-0.028-0.111-0.043-0.165-0.043c-0.119,0-0.263,0.048-0.431,0.144
		c-0.168,0.095-0.458,0.327-0.871,0.697v1.493h1.207c0.067,0,0.115,0.013,0.143,0.037c0.028,0.025,0.043,0.058,0.043,0.099
		c0,0.039-0.015,0.072-0.043,0.098c-0.027,0.026-0.075,0.039-0.143,0.039h-2.139c-0.064,0-0.111-0.013-0.14-0.037
		c-0.028-0.025-0.042-0.057-0.042-0.096c0-0.037,0.014-0.067,0.041-0.093c0.026-0.024,0.073-0.037,0.141-0.037h0.659V25.83h-0.503
		c-0.065,0-0.111-0.014-0.14-0.039c-0.028-0.026-0.042-0.06-0.042-0.101c0-0.039,0.013-0.071,0.04-0.098s0.074-0.039,0.142-0.039
		H43.64z"/>
	<path fill="#FFF" d="M49.478,26.965c0,0.415-0.148,0.77-0.446,1.064c-0.297,0.294-0.656,0.441-1.075,0.441
		c-0.425,0-0.785-0.148-1.081-0.443c-0.297-0.295-0.444-0.649-0.444-1.063c0-0.416,0.147-0.771,0.444-1.066
		c0.296-0.295,0.656-0.443,1.081-0.443c0.419,0,0.778,0.147,1.075,0.441C49.329,26.192,49.478,26.547,49.478,26.965z M49.202,26.965
		c0-0.342-0.122-0.633-0.365-0.873s-0.538-0.36-0.885-0.36c-0.346,0-0.641,0.12-0.884,0.361c-0.244,0.241-0.365,0.532-0.365,0.872
		c0,0.337,0.121,0.627,0.365,0.869c0.243,0.242,0.538,0.364,0.884,0.364c0.347,0,0.642-0.121,0.885-0.362
		S49.202,27.305,49.202,26.965z"/>
	<path fill="#FFF" d="M50.916,25.553v0.497c0.162-0.197,0.336-0.346,0.522-0.445c0.186-0.1,0.405-0.149,0.658-0.149
		c0.269,0,0.517,0.063,0.743,0.188c0.228,0.126,0.403,0.301,0.527,0.524c0.125,0.224,0.187,0.459,0.187,0.706
		c0,0.392-0.14,0.727-0.42,1.004c-0.28,0.278-0.625,0.417-1.033,0.417c-0.487,0-0.882-0.198-1.185-0.594v1.643h0.662
		c0.064,0,0.111,0.012,0.139,0.037c0.028,0.024,0.043,0.058,0.043,0.099c0,0.039-0.015,0.071-0.043,0.098
		c-0.027,0.025-0.074,0.039-0.139,0.039h-1.302c-0.065,0-0.111-0.013-0.14-0.037c-0.028-0.025-0.042-0.059-0.042-0.1
		s0.014-0.074,0.042-0.099c0.028-0.025,0.074-0.037,0.14-0.037h0.366V25.83h-0.366c-0.065,0-0.111-0.014-0.14-0.039
		c-0.028-0.026-0.042-0.06-0.042-0.101c0-0.039,0.014-0.071,0.042-0.098s0.074-0.039,0.14-0.039H50.916z M53.278,26.875
		c0-0.314-0.114-0.583-0.343-0.807c-0.228-0.224-0.507-0.336-0.835-0.336c-0.331,0-0.611,0.112-0.841,0.337
		c-0.229,0.226-0.344,0.494-0.344,0.806c0,0.313,0.114,0.583,0.344,0.808c0.229,0.226,0.51,0.338,0.841,0.338
		c0.326,0,0.604-0.112,0.834-0.336C53.163,27.459,53.278,27.19,53.278,26.875z"/>
	<path fill="#FFF" d="M8.087,36.34l-1.266-2.534H6.74c-0.065,0-0.112-0.014-0.14-0.039c-0.028-0.026-0.042-0.059-0.042-0.098
		c0-0.028,0.007-0.054,0.021-0.076c0.014-0.022,0.032-0.039,0.055-0.049c0.022-0.01,0.058-0.015,0.105-0.015h0.746
		c0.065,0,0.111,0.013,0.14,0.039s0.042,0.06,0.042,0.101c0,0.039-0.014,0.071-0.042,0.098c-0.028,0.025-0.075,0.039-0.14,0.039
		H7.12l1.113,2.235l1.097-2.235H8.963c-0.065,0-0.111-0.014-0.139-0.039c-0.028-0.026-0.042-0.06-0.042-0.101
		c0-0.039,0.014-0.071,0.042-0.098c0.028-0.026,0.074-0.039,0.139-0.039h0.743c0.067,0,0.115,0.013,0.143,0.039
		c0.028,0.026,0.042,0.06,0.042,0.101c0,0.028-0.009,0.054-0.026,0.078c-0.017,0.023-0.037,0.039-0.059,0.047
		c-0.021,0.008-0.082,0.012-0.182,0.012L7.898,37.32h0.425c0.065,0,0.111,0.012,0.14,0.037c0.028,0.024,0.042,0.058,0.042,0.099
		c0,0.039-0.014,0.071-0.042,0.098c-0.028,0.025-0.075,0.039-0.14,0.039H6.753c-0.065,0-0.111-0.013-0.14-0.037
		c-0.028-0.025-0.042-0.059-0.042-0.1s0.014-0.074,0.042-0.099c0.028-0.025,0.075-0.037,0.14-0.037h0.854L8.087,36.34z"/>
	<path fill="#FFF" d="M13.581,34.941c0,0.415-0.149,0.77-0.446,1.064c-0.297,0.294-0.656,0.441-1.076,0.441
		c-0.424,0-0.785-0.148-1.081-0.443s-0.444-0.649-0.444-1.063c0-0.416,0.148-0.771,0.444-1.066s0.657-0.443,1.081-0.443
		c0.419,0,0.778,0.147,1.076,0.441C13.432,34.168,13.581,34.523,13.581,34.941z M13.305,34.941c0-0.342-0.122-0.633-0.365-0.873
		c-0.243-0.24-0.538-0.36-0.884-0.36s-0.641,0.12-0.884,0.361c-0.244,0.241-0.365,0.532-0.365,0.872
		c0,0.337,0.122,0.627,0.365,0.869c0.243,0.242,0.538,0.364,0.884,0.364s0.641-0.121,0.884-0.362
		C13.184,35.571,13.305,35.281,13.305,34.941z"/>
	<path fill="#FFF" d="M16.979,36.34V35.94c-0.372,0.338-0.774,0.507-1.207,0.507c-0.266,0-0.469-0.073-0.607-0.218
		c-0.18-0.19-0.27-0.412-0.27-0.665v-1.759h-0.367c-0.065,0-0.111-0.014-0.14-0.039c-0.028-0.026-0.042-0.06-0.042-0.101
		c0-0.039,0.014-0.071,0.042-0.098c0.028-0.026,0.075-0.039,0.14-0.039h0.639v2.035c0,0.177,0.057,0.323,0.169,0.438
		c0.112,0.115,0.253,0.173,0.422,0.173c0.443,0,0.85-0.204,1.22-0.61v-1.759h-0.503c-0.065,0-0.111-0.014-0.14-0.039
		c-0.028-0.026-0.042-0.06-0.042-0.101c0-0.039,0.014-0.071,0.042-0.098s0.075-0.039,0.14-0.039h0.775v2.538h0.23
		c0.065,0,0.111,0.013,0.14,0.037c0.028,0.025,0.042,0.058,0.042,0.099c0,0.039-0.014,0.072-0.042,0.098
		c-0.028,0.026-0.075,0.039-0.14,0.039H16.979z"/>
	<path fill="#FFF" d="M19.708,33.529v0.688c0.355-0.32,0.621-0.526,0.797-0.618c0.176-0.093,0.339-0.139,0.488-0.139
		c0.163,0,0.313,0.055,0.453,0.164c0.14,0.109,0.209,0.192,0.209,0.248c0,0.041-0.014,0.075-0.041,0.103s-0.061,0.041-0.102,0.041
		c-0.022,0-0.04-0.004-0.055-0.012s-0.043-0.032-0.084-0.073c-0.076-0.075-0.142-0.128-0.198-0.155
		c-0.056-0.028-0.111-0.043-0.165-0.043c-0.119,0-0.263,0.048-0.43,0.144c-0.168,0.095-0.458,0.327-0.872,0.697v1.493h1.208
		c0.067,0,0.115,0.013,0.143,0.037c0.028,0.025,0.042,0.058,0.042,0.099c0,0.039-0.014,0.072-0.042,0.098
		c-0.028,0.026-0.076,0.039-0.143,0.039h-2.139c-0.065,0-0.112-0.013-0.14-0.037c-0.028-0.025-0.042-0.057-0.042-0.096
		c0-0.037,0.013-0.067,0.041-0.093c0.027-0.024,0.074-0.037,0.141-0.037h0.659v-2.271h-0.503c-0.065,0-0.111-0.014-0.14-0.039
		c-0.028-0.026-0.042-0.06-0.042-0.101c0-0.039,0.013-0.071,0.041-0.098c0.027-0.026,0.074-0.039,0.141-0.039H19.708z"/>
	<path fill="#FFF" d="M28.987,32.815v-0.091c0-0.065,0.012-0.111,0.037-0.14s0.058-0.042,0.099-0.042
		c0.041,0,0.074,0.014,0.099,0.042s0.038,0.074,0.038,0.14v0.694c0,0.065-0.013,0.111-0.038,0.14s-0.058,0.042-0.099,0.042
		c-0.039,0-0.071-0.013-0.096-0.039c-0.025-0.025-0.039-0.067-0.041-0.126c-0.011-0.182-0.104-0.346-0.281-0.49
		c-0.177-0.145-0.408-0.218-0.693-0.218c-0.301,0-0.54,0.077-0.717,0.232c-0.178,0.154-0.266,0.337-0.266,0.547
		c0,0.108,0.025,0.206,0.075,0.295c0.049,0.089,0.116,0.161,0.198,0.216c0.082,0.056,0.175,0.1,0.279,0.133
		c0.104,0.034,0.266,0.069,0.487,0.105c0.37,0.062,0.625,0.123,0.766,0.186c0.188,0.084,0.331,0.201,0.427,0.351
		s0.145,0.325,0.145,0.529c0,0.312-0.125,0.577-0.373,0.796c-0.249,0.22-0.584,0.33-1.006,0.33c-0.474,0-0.853-0.148-1.136-0.445
		v0.156c0,0.064-0.013,0.111-0.038,0.14s-0.058,0.042-0.099,0.042c-0.039,0-0.071-0.014-0.098-0.042
		c-0.026-0.028-0.039-0.075-0.039-0.14v-0.753c0-0.067,0.012-0.114,0.037-0.143s0.058-0.043,0.099-0.043
		c0.039,0,0.071,0.014,0.096,0.039c0.025,0.026,0.038,0.068,0.041,0.127c0.011,0.199,0.117,0.38,0.32,0.544
		c0.202,0.163,0.474,0.245,0.816,0.245s0.612-0.086,0.81-0.257c0.198-0.171,0.297-0.373,0.297-0.606
		c0-0.144-0.038-0.271-0.114-0.382s-0.188-0.199-0.337-0.265c-0.104-0.045-0.32-0.096-0.649-0.152
		c-0.452-0.076-0.778-0.191-0.977-0.348c-0.199-0.155-0.299-0.377-0.299-0.665c0-0.285,0.114-0.531,0.343-0.736
		c0.228-0.206,0.529-0.309,0.904-0.309C28.384,32.455,28.712,32.575,28.987,32.815z"/>
	<path fill="#FFF" d="M32.203,36.34h-0.38l-1.373-3.524H30.24c-0.05,0-0.086-0.005-0.107-0.015s-0.04-0.026-0.053-0.049
		c-0.014-0.022-0.021-0.047-0.021-0.073c0-0.025,0.007-0.05,0.021-0.072c0.014-0.023,0.032-0.039,0.053-0.049
		s0.058-0.015,0.107-0.015h1.016c0.052,0,0.088,0.005,0.109,0.015c0.021,0.01,0.038,0.025,0.052,0.049
		c0.014,0.022,0.021,0.047,0.021,0.072c0,0.026-0.007,0.051-0.022,0.073s-0.033,0.039-0.054,0.049s-0.056,0.015-0.105,0.015h-0.522
		l1.266,3.252h0.02l1.25-3.252h-0.52c-0.052,0-0.088-0.005-0.11-0.015c-0.021-0.01-0.039-0.026-0.053-0.049
		c-0.015-0.022-0.021-0.047-0.021-0.073c0-0.025,0.008-0.05,0.022-0.072c0.016-0.023,0.033-0.039,0.054-0.049
		s0.057-0.015,0.108-0.015h1.013c0.052,0,0.089,0.005,0.11,0.015s0.04,0.025,0.054,0.049c0.014,0.022,0.021,0.047,0.021,0.072
		c0,0.026-0.008,0.051-0.023,0.073c-0.015,0.022-0.032,0.039-0.053,0.049c-0.021,0.01-0.058,0.015-0.109,0.015h-0.207L32.203,36.34z
		"/>
	<path fill="#FFF" d="M37.47,34.932V36.1c-0.207,0.115-0.414,0.201-0.621,0.26s-0.413,0.088-0.618,0.088
		c-0.292,0-0.549-0.044-0.771-0.13c-0.222-0.087-0.41-0.208-0.563-0.363c-0.153-0.156-0.273-0.33-0.358-0.523
		c-0.086-0.192-0.128-0.437-0.128-0.733v-0.499c0-0.299,0.073-0.589,0.222-0.872c0.148-0.282,0.352-0.498,0.608-0.647
		c0.258-0.148,0.538-0.224,0.841-0.224c0.439,0,0.811,0.121,1.113,0.361c0-0.106,0.004-0.17,0.012-0.191
		c0.007-0.021,0.022-0.041,0.047-0.057c0.023-0.017,0.051-0.024,0.081-0.024c0.039,0,0.071,0.014,0.098,0.042
		c0.025,0.028,0.038,0.074,0.038,0.14v0.616c0,0.067-0.013,0.114-0.038,0.142c-0.026,0.027-0.059,0.04-0.098,0.04
		c-0.037,0-0.067-0.012-0.093-0.037c-0.024-0.024-0.038-0.068-0.04-0.131c-0.014-0.185-0.133-0.335-0.359-0.451
		c-0.226-0.117-0.472-0.176-0.738-0.176c-0.251,0-0.478,0.055-0.68,0.164s-0.391,0.317-0.566,0.625
		c-0.116,0.201-0.175,0.43-0.175,0.685v0.496c0,0.453,0.139,0.812,0.415,1.078c0.277,0.266,0.659,0.399,1.146,0.399
		c0.165,0,0.317-0.018,0.458-0.053c0.141-0.034,0.305-0.095,0.493-0.182v-1.009h-0.938c-0.065,0-0.112-0.013-0.14-0.037
		c-0.028-0.025-0.043-0.059-0.043-0.1s0.015-0.074,0.043-0.101c0.027-0.025,0.074-0.039,0.14-0.039l1.311,0.004
		c0.065,0,0.111,0.012,0.14,0.037c0.028,0.024,0.042,0.058,0.042,0.099c0,0.028-0.009,0.055-0.025,0.078
		c-0.018,0.023-0.037,0.039-0.059,0.047S37.578,34.932,37.47,34.932z"/>
	<path fill="#FFF" d="M43.785,33.806v2.262h1.198c0.064,0,0.111,0.013,0.14,0.037c0.027,0.025,0.042,0.058,0.042,0.099
		c0,0.039-0.015,0.072-0.042,0.098c-0.028,0.026-0.075,0.039-0.14,0.039h-2.133c-0.064,0-0.111-0.013-0.14-0.039
		c-0.027-0.025-0.042-0.059-0.042-0.098c0-0.041,0.015-0.073,0.042-0.099c0.028-0.024,0.075-0.037,0.14-0.037h0.659v-2.262h-0.591
		c-0.064,0-0.111-0.014-0.14-0.039c-0.028-0.026-0.042-0.06-0.042-0.101c0-0.039,0.014-0.071,0.042-0.098s0.075-0.039,0.14-0.039
		h0.591v-0.412c0-0.229,0.093-0.429,0.279-0.597c0.186-0.169,0.433-0.254,0.739-0.254c0.258,0,0.532,0.024,0.825,0.071
		c0.11,0.018,0.177,0.038,0.199,0.063c0.022,0.023,0.034,0.055,0.034,0.094c0,0.04-0.013,0.072-0.039,0.096
		c-0.026,0.025-0.061,0.037-0.104,0.037c-0.018,0-0.047-0.003-0.088-0.01c-0.327-0.05-0.603-0.074-0.828-0.074
		c-0.237,0-0.421,0.059-0.55,0.175c-0.129,0.117-0.193,0.25-0.193,0.399v0.412h1.275c0.065,0,0.112,0.013,0.14,0.039
		c0.028,0.026,0.043,0.06,0.043,0.101c0,0.039-0.015,0.071-0.043,0.098c-0.027,0.025-0.074,0.039-0.14,0.039H43.785z"/>
	<path fill="#FFF" d="M48.099,33.529v2.538h1.071c0.067,0,0.114,0.013,0.143,0.037c0.028,0.025,0.042,0.058,0.042,0.099
		c0,0.039-0.014,0.072-0.042,0.098c-0.028,0.026-0.075,0.039-0.143,0.039h-2.415c-0.064,0-0.111-0.013-0.139-0.039
		c-0.028-0.025-0.043-0.059-0.043-0.098c0-0.041,0.015-0.073,0.043-0.099c0.027-0.024,0.074-0.037,0.139-0.037h1.071v-2.262h-0.795
		c-0.065,0-0.112-0.014-0.142-0.039c-0.029-0.026-0.044-0.059-0.044-0.098c0-0.041,0.015-0.074,0.043-0.101
		c0.027-0.026,0.075-0.039,0.143-0.039H48.099z M48.089,32.13v0.705h-0.402V32.13H48.089z"/>
	<path fill="#FFF" d="M52.081,32.266v3.801h1.07c0.067,0,0.115,0.013,0.143,0.037c0.028,0.025,0.043,0.058,0.043,0.099
		c0,0.039-0.015,0.072-0.043,0.098c-0.027,0.026-0.075,0.039-0.143,0.039h-2.414c-0.065,0-0.111-0.013-0.14-0.039
		c-0.028-0.025-0.042-0.059-0.042-0.098c0-0.041,0.014-0.073,0.042-0.099c0.028-0.024,0.074-0.037,0.14-0.037h1.07v-3.524h-0.785
		c-0.064,0-0.111-0.013-0.141-0.039c-0.029-0.027-0.044-0.06-0.044-0.101c0-0.039,0.014-0.071,0.042-0.098
		c0.028-0.025,0.076-0.039,0.143-0.039H52.081z"/>
	<path fill="#FFF" d="M57.406,35h-2.777c0.047,0.353,0.195,0.636,0.442,0.852c0.248,0.215,0.555,0.323,0.92,0.323
		c0.204,0,0.417-0.034,0.64-0.102c0.223-0.066,0.404-0.155,0.545-0.266c0.041-0.032,0.077-0.049,0.107-0.049
		c0.034,0,0.064,0.014,0.091,0.041c0.026,0.026,0.039,0.059,0.039,0.096c0,0.036-0.018,0.072-0.052,0.106
		c-0.104,0.108-0.288,0.21-0.554,0.304c-0.265,0.094-0.537,0.142-0.816,0.142c-0.467,0-0.857-0.153-1.17-0.46
		c-0.313-0.306-0.469-0.676-0.469-1.111c0-0.396,0.146-0.735,0.439-1.019c0.294-0.283,0.656-0.426,1.089-0.426
		c0.446,0,0.813,0.146,1.101,0.437S57.411,34.536,57.406,35z M57.131,34.724c-0.055-0.301-0.196-0.545-0.427-0.733
		s-0.505-0.282-0.823-0.282c-0.317,0-0.592,0.093-0.82,0.279c-0.229,0.186-0.372,0.432-0.429,0.736H57.131z"/>
</g>
</svg>
</p>
"""
