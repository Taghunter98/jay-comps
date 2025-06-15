const path = require('path');

module.exports = {
    entry: './src/comp.ts',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    output: {
        filename: 'comp.js', 
        path: path.resolve(__dirname, 'dist'),
        library: 'CompLibrary', 
        libraryTarget: 'umd'  
    },
    mode: 'production'
};
