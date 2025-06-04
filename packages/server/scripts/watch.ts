import webpack from 'webpack';
import config from '../webpack.config';
import { spawn } from 'child_process';

const compiler = webpack(config());

let started = false;

compiler.watch({}, (err, stats) => {
  if (err) {
    console.error('Webpack error:', err);
    return;
  }

  console.log(stats.toString({ colors: true }));

  if (!started) {
    started = true;
    console.log('Initial build complete. Starting nodemon...');
    spawn('npx', ['nodemon', './dist', '--watch', './dist'], {
      stdio: 'inherit',
      shell: true,
    });
  }
});
