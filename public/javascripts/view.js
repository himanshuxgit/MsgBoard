
  
  document.addEventListener('DOMContentLoaded', function () {
    // Select all message containers
    const messageContainers = document.querySelectorAll('.message-container');
  
    // Loop through each message container
    messageContainers.forEach(function (container) {
      container.style.height = container.offsetWidth + 'px';
    });
  });
  function deleteMessage(messageId) {
    if (confirm("Are you sure you want to delete this message?")) {
      fetch('/messages/' + messageId, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => {
          if (response.ok) {
            window.location.reload();
          } else {
            console.error('Failed to delete message:', response.status);
          }
        })
        .catch((error) => {
          console.error('Error deleting message:', error);
        });
    }
  }