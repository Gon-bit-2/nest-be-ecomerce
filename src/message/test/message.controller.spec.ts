import { Test, TestingModule } from '@nestjs/testing'
import { CreateMessageDTO, GetMessageParamsDTO } from 'src/message/dto/message.dto'
import { MessageController } from 'src/message/message.controller'
import { MessageService } from 'src/message/message.service'

describe('MessageController', () => {
  let controller: MessageController
  let service: MessageService

  const mockMessageService = {
    sendMessage: jest.fn(),
    getConversations: jest.fn(),
    getMessages: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessageController],
      providers: [
        {
          provide: MessageService,
          useValue: mockMessageService,
        },
      ],
    }).compile()

    controller = module.get<MessageController>(MessageController)
    service = module.get<MessageService>(MessageService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('sendMessage', () => {
    it('should call sendMessage on service and return result', async () => {
      const userId = 1
      const body: CreateMessageDTO = { receiverId: 2, content: 'Hello' }
      const expectedResult = { id: 1, ...body, senderId: userId }

      mockMessageService.sendMessage.mockResolvedValue(expectedResult)

      const result = await controller.sendMessage(userId, body)

      expect(service.sendMessage).toHaveBeenCalledWith(userId, body)
      expect(result).toEqual(expectedResult)
    })
  })

  describe('getConversations', () => {
    it('should call getConversations on service and return result', async () => {
      const userId = 1
      const expectedConversations = [{ id: 10, name: 'Convo' }]

      mockMessageService.getConversations.mockResolvedValue(expectedConversations)

      const result = await controller.getConversations(userId)

      expect(service.getConversations).toHaveBeenCalledWith(userId)
      expect(result).toEqual(expectedConversations)
    })
  })

  describe('getMessages', () => {
    it('should call getMessages on service and return result', async () => {
      const userId = 1
      const params: GetMessageParamsDTO = { conversationId: 100 }
      const expectedMessages = [{ id: 1, content: 'Hi' }]

      mockMessageService.getMessages.mockResolvedValue(expectedMessages)

      const result = await controller.getMessages(userId, params)

      expect(service.getMessages).toHaveBeenCalledWith(userId, params.conversationId)
      expect(result).toEqual(expectedMessages)
    })
  })
})
