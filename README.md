# Create GitHub release from package.json

## How to use it

```yaml
steps:
  - name: Checkout
    id: checkout
    uses: actions/checkout@v4

  - name: Create a Github release based on package.json version
    uses: @danielnakamashi/simple-github-release
    with:
      token: ${{secrets.TOKEN}}
```
