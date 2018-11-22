// Import Lodash library
const _ = require('lodash');

// Permissions array from the database.
const permissionsArray = [
  {
    name: 'Home Appliances',
    rules : {
      read: true,
      write: true,
      delete: true
    }
  },
  {
    name: 'Haberdashery',
    rules : {
      read: true,
      write: true,
      delete: false
    },
  },
  {
    name: 'Inventory',
    rules: {
      read: true,
      write: true,
      delete: false
    }
  }
  // ... Add new permissions to this collection
];

// Create a blank permisions object
const _permissions = {};

// Populate the _permissions from the permissions array
permissionsArray.forEach(perm => {
  const camelCasedPermissionName = _.camelCase(perm.name);
  const rules = perm.rules;

  _permissions[camelCasedPermissionName] = rules;
});
// Done!

// The proxy
const permissions = new Proxy(_permissions, {
  get: function (target, prop) {
    // More ES2015 goodness. Destructuring assignment
    const [can, perm, ...categoryArr] = prop.split('_');
    const category = categoryArr.join('_');

    // We'll get some help from the lodash library here
    const categoryCamelCase = _.camelCase(category);

    const permissionCategory = target[categoryCamelCase];
    // Check if it exists. Throw error if it doesn't
    if (permissionCategory) {
      const permLowercase = perm.toLowerCase();

      // If permission is allowed.
      if (permissionCategory[permLowercase]) {
        // e.g 'CAN READ HOME_APPLIANCES'
        const permissionString = [can, perm, category].join(' ').toUpperCase();
        return permissionString;
      } else {
        throw new Error(`Permission Error: '${perm}' is not allowed on category '${category}'`);
      }
    } else {
      throw new Error(`Permission Error: '${category}' does not exist on permission object`);
    }
  }
});

console.log(permissions.CAN_READ_HOME_APPLIANCES);
// CAN READ HOME_APPLIANCES

console.log(permissions['CAN_WRITE_HABERDASHERY']);
// CAN WRITE HABERDASHERY

console.log(permissions['CAN_READ_INVENTORY']);
// CAN READ INVENTORY

console.log(permissions['CAN_DELETE_HABERDASHERY']);
// Permission Error: 'DELETE' is not allowed on category 'HABERDASHERY'

console.log(permissions.CAN_READ_ELECTRONICS);
// Permission Error: 'ELECTRONICS' does not exist on permission object

console.log(permissions['CAN_ADD_HOME_APPLIANCES']);
// Permission Error: The permission 'ADD' is not allowed on 'HOME_APPLIANCES'