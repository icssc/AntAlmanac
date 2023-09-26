import { build } from 'esbuild'

async function main() {
  await build({
    bundle: true,
    minify: true,
    platform: 'node',
    target: 'node18',
    outdir: 'dist',
    entryPoints: {
      lambda: 'src/lambda.ts',
    }
  })
}

main()
