const fs = require('fs')
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin')
const paths = require('react-scripts/config/paths')

function expandResolveAlias(resolve, alias) {
  resolve.alias = Object.assign(resolve.alias || {}, alias)
}

function expandRulesInclude(rules, include) {
  rules.forEach(function(rule) {
    if(rule.include === paths.appSrc)
      rule.include = include.concat(rule.include)
    if(rule.oneOf)
      expandRulesInclude(rule.oneOf, include)
  })
}

function expandPluginsScope(plugins, dirs, files) {
  dirs = [
    paths.appSrc,
    ...dirs.filter(
      dir => !fs.existsSync(dir) || fs.lstatSync(dir).isDirectory()
    )
  ]
  files = [
    paths.appPackageJson,
    ...dirs.filter(dir => fs.existsSync(dir) && fs.lstatSync(dir).isFile()),
    ...(files || []),
  ]
  const pluginName = 'ModuleScopePlugin'
  const pluginPos = plugins
    .map(x => x.constructor.name)
    .indexOf(pluginName)
  if(pluginPos !== -1) {
    plugins.splice(pluginPos, 1)
    plugins[pluginPos] = new ModuleScopePlugin(dirs, files)
  }
}

function alias(aliasMap) {
  const aliasLocal = Object.keys(aliasMap).reduce( (a,i) => {
    a[i] = path.resolve(paths.appSrc, aliasMap[i])
  }, {})
  return function(config) {
    expandResolveAlias(config.resolve, aliasLocal)
    expandRulesInclude(config.module.rules, Object.values(aliasLocal))
    expandPluginsScope(config.resolve.plugins, Object.values(aliasLocal))
  }
}

module.exports = {
  alias
}