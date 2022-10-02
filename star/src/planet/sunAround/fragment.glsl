module.exports="#define GLSLIFY 1\n#define OCTAVES  6\nuniform float time;\nuniform float progress;\nuniform sampler2D texture1;\nuniform vec4 resolution;\nvarying vec2 vUv;\nvarying vec3 vPosition;\nvarying vec3 vLayer0;\nvarying vec3 vLayer1;\nvarying vec3 vLayer2;\nvarying vec3 vNormal;\nfloat PI = 3.141592653589793238;\n\nuniform samplerCube uPerlinCube;\n\nfloat ocean(in vec3 p){\n\tfloat sum = 0.;\n\tsum += textureCube(uPerlinCube, vLayer0).r;\n\tsum += textureCube(uPerlinCube, vLayer1).r;\n\tsum += textureCube(uPerlinCube, vLayer2).r;\n\treturn sum * 0.33;\n}\n\nfloat uTint = 0.36;\nfloat uBrightness = 0.6;\nvec3 brightnessToColor(float b)\n{\n\tb *= uTint;\n\treturn (vec3(b, b * b, b*b*b * b)/ (uTint)) * uBrightness;\n}\n\nfloat getAlpha(vec3 n)\n{\n//\tfloat nDotL = dot(n, l) * uDirection;\nfloat nDotL = dot(n, normalize(vec3(1.))) ;\nreturn smoothstep(1., 1.5, nDotL +  2.5);\n}\n\nvoid main()\t{\n\tgl_FragColor = vec4(1.,0.,0.,1.);\n\tgl_FragColor = vec4(vPosition.z,0.,0.,1.);\n\n\tfloat vRadial = vPosition.z;\n\tfloat alpha = (1. - vRadial);\n\talpha *= alpha*alpha;\n\tfloat brightness = 1. + alpha * 0.83;\n\t// alpha *= getAlpha(normalize(vPosition));\n\n\tgl_FragColor.xyz = brightnessToColor(brightness) * alpha;\n\t// gl_FragColor.a = alpha - 0.4;\n\t\t\t\t// gl_FragColor = vec4(alpha,0.,0.,1.);\n\t\t\t\t\n\t\n}";