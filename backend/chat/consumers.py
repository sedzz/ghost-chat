from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from django.utils import timezone
from .models import ChatRoom
import json

class ChatConsumer(WebsocketConsumer):

    def connect(self):
        self.id = self.scope['url_route']['kwargs']['hash_id']
        self.room_group_name = 'chat_%s' % self.id
        self.user = self.scope['user']

        try:
            chat_room = ChatRoom.objects.get(hash_id=self.id)
            if self.user.is_authenticated and self.user in chat_room.users.all():
                async_to_sync(self.channel_layer.group_add)(
                    self.room_group_name,
                    self.channel_name
                )
                self.accept()
                print('Conexión establecida')

                async_to_sync(self.channel_layer.group_send)(
                    self.room_group_name,
                    {
                        'type': 'system_message',
                        'message': f'{self.user.username} se ha conectado',
                        'datetime': timezone.localtime(timezone.now()).strftime('%Y-%m-%d %H:%M:%S'),
                    }
                )
            else:
                print('Usuario no autorizado para unirse a la sala de chat')
                self.close()
        except ChatRoom.DoesNotExist:
            print('Sala de chat no encontrada')
            self.close()

    def disconnect(self, close_code):
        print('Conexión cerrada')
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'system_message',
                'message': f'{self.user.username} se ha desconectado',
                'datetime': timezone.localtime(timezone.now()).strftime('%Y-%m-%d %H:%M:%S'),
            }
        )

    def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message = text_data_json['message']
            message_type = text_data_json.get('type', 'text')

            sender_id = None
            if self.scope['user'].is_authenticated:
                sender_id = self.scope['user'].id

            if sender_id:
                print(f'Received message: {message} from user: {self.user.username}')
                async_to_sync(self.channel_layer.group_send)(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'message': message,
                        'username': self.user.username,
                        'datetime': timezone.localtime(timezone.now()).strftime('%Y-%m-%d %H:%M:%S'),
                        'sender_id': sender_id,
                        'message_type': message_type
                    }
                )
            else:
                print('User is not authenticated.')

        except Exception as e:
            print('Error', e)

    def chat_message(self, event):
        message = event['message']
        username = event['username']
        datetime = event['datetime']
        sender_id = event['sender_id']
        message_type = event.get('message_type', 'text')

        current_user_id = self.scope['user'].id

        print(f'Sender ID: {sender_id}')
        print(f'Current user ID: {current_user_id}')

        print(f'Sending message: {message} to user: {username}')
        self.send(text_data=json.dumps({
            'message': message,
            'username': username,
            'datetime': datetime,
            'type': message_type
        }))

    def system_message(self, event):
        message = event['message']
        datetime = event['datetime']

        print(f'Sending system message: {message}')
        self.send(text_data=json.dumps({
            'message': message,
            'username': 'System',
            'datetime': datetime,
        }))