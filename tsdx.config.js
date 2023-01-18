const path = require('path');
const relativePath = p => path.join(__dirname, "src/" + p);
const postcss = require('rollup-plugin-scss');
const { terser } = require('rollup-plugin-terser');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

module.exports = {
    rollup(config, options) {
        config.plugins.push(
            postcss({
                modules: true,
                plugins: [
                    autoprefixer(),
                    cssnano({
                        preset: 'default',
                    }),
                ],
                inject: false,
                // only write out CSS for the first bundle (avoids pointless extra files):
                extract: !!options.writeMeta,
                minimize: true,
            }),
            terser()
        );
        // config.plugins.push(
        //     postcss({
        //         inject: false,
        //         extract: !!options.writeMeta,
        //     }),
        // );

        if (options.format === "esm") {
            // we use this to output separate chunk for /src/validators
            // see: https://stackoverflow.com/a/65173887
            return {
                ...config,
                input: [
                    relativePath("index.tsx"),

                    // relativePath("form/button.tsx"),
                    // relativePath("form/buttongroup.tsx"),
                    // relativePath("form/checkbox.tsx"),
                    // relativePath("form/checkboxgroup.tsx"),
                    // relativePath("form/component.tsx"),
                    // // relativePath("form/date.tsx"),
                    // relativePath("form/group.tsx"),
                    // relativePath("form/form.tsx"),
                    // relativePath("form/input.tsx"),
                    // relativePath("form/label.tsx"),
                    // relativePath("form/layout.tsx"),
                    // relativePath("form/radiobutton.tsx"),
                    // relativePath("form/select.tsx"),
                    // relativePath("form/spinner.tsx"),
                    // relativePath("form/switch.tsx"),
                    // relativePath("form/upload.tsx"),

                    // relativePath("modal/modal.tsx"),
                    // relativePath("modal/contentconfirmation.tsx"),
                    // relativePath("modal/modalconfirmation.tsx"),

                    // relativePath("models/models.ts"),



                    // relativePath("table/table.tsx"),

                    // relativePath("tabs/tabs.tsx"),

                ],
                output: {
                    format: 'cjs',
                    dir: 'dist',
                    exports: 'auto',
                    preserveModules: true,
                    preserveModulesRoot: 'src',
                    sourcemap: true,
                },
            };
        } else {
            return config;
        }
    },
    // rollup(config, options) {
    //     return config
    // }
};