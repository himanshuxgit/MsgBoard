
  
  document.addEventListener('DOMContentLoaded', function () {
    // Select all message containers
    const messageContainers = document.querySelectorAll('.message-container');
  
    // Loop through each message container
    messageContainers.forEach(function (container) {
      container.style.height = container.offsetWidth + 'px';
    });
  });
  