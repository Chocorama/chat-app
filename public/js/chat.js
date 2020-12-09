const socket = io();

//elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');
const $sidebar = document.querySelector('#sidebar');

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const urlTemplate = document.querySelector('#url-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

//Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoscroll = () => {
  //New message element
  const $newMessage = $messages.lastElementChild;

  //height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  //visible height
  const visibleHeight = $messages.offsetHeight;

  //Height of messages container
  const containerHeight = $messages.scrollHeight;

  //how far have I scrolled
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on('message', (message) => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('[sent @] h:mm a'),
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

socket.on('locationMessage', (url) => {
  console.log(url);

  const html = Mustache.render(urlTemplate, {
    username: url.username,
    url: url.url,
    createdAt: moment(url.createdAt).format('[sent @] h:mm a'),
  });
  $messages.insertAdjacentHTML('beforeend', html);
});

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  $sidebar.innerHTML = html;
});

$messageForm.addEventListener('submit', (e) => {
  e.preventDefault();

  $messageFormButton.setAttribute('disabled', '');

  //disable form

  const message = e.target.elements.message.value;

  socket.emit('sendMessage', message, (error) => {
    $messageFormButton.removeAttribute('disabled');
    $messageFormInput.value = '';
    $messageFormInput.focus();
    //enable
    if (error) {
      return console.log(error);
    }

    console.log('message delivered');
  });
});

$sendLocationButton.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('geolocation is not supported by your browser');
  }

  $sendLocationButton.setAttribute('disabled', '');

  navigator.geolocation.getCurrentPosition(
    ({ coords: { latitude, longitude } }) => {
      socket.emit('sendLocation', { latitude, longitude }, () => {
        $sendLocationButton.removeAttribute('disabled');
        console.log('Location shared');
      });
    }
  );
});

socket.emit('join', { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = '/';
  }
});
