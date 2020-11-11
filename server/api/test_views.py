from django.test import TestCase
from django.core import mail
from django.test import Client

# Create your tests here.

'''
class HelloWorldTest(TestCase):
    def test_HelloWorld(self):
        response = self.client.get('/api/hello/')
        self.assertEqual(response.status_code, 200)

class EmailViewsTest(TestCase):
    def test_send_emails(self):
        # Send message.
        mail.send_mail(
            'Subject here', 'Here is the message.',
            'from@example.com', ['to@example.com'],
            fail_silently=False,
        )

        # Test that one message has been sent.
        self.assertEqual(len(mail.outbox), 1)

        # Verify that the subject of the first message is correct.
        self.assertEqual(mail.outbox[0].subject, 'Subject here')
'''

