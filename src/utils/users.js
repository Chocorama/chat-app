const users = [];

const addUser = ({ id, username, room }) => {
  //clean data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //validate the data
  if (!username || !room) {
    return {
      error: 'Username and room are required',
    };
  }

  //check for existing user
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  //validate username
  if (existingUser) {
    return {
      error: 'Username is in use',
    };
  }

  //store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

// every connection to server has a unique ID that well learn to access in lesson 169. for adduser above we can accept 3 seperate arguments or an object with them on as properties. we'll just take the destructured object route. //cleaning the data like lowercase get rid of extra spaces

const removeUser = (id) => {
  const index = users.findIndex((user) => {
    return user.id === id;
  });

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
  //we could use filter instead but this code is faster since its searching for one index. filter would keep looking even after match was found
  //if match is not found, find index returns a -1 for false
  //we add the [0] because by default we are returning an array and we dont want to return an array we want the item we removed as an object so we use bracket notation to select the first and only object in it
};

const getUser = (id) => {
  const userFound = users.find((user) => {
    return user.id === id;
  });

  if (!id) {
    return {
      error: 'Please add an id to search',
    };
  }

  if (!userFound) {
    return {
      error: 'There arent any users with that name',
    };
  }

  return userFound;
};

const getUsersInRoom = (room) => {
  const usersArray = users.filter((user) => {
    return user.room === room;
  });

  return usersArray;
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
