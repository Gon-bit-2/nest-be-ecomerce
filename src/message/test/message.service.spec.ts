import { Test, TestingModule } from '@nestjs/testing'
import { MessageService } from '../message.service'
import { MessageRepository } from '../repository/message.repository'
import { MessageGateway } from '../gateway/message.gateway'
import { BadRequestException } from '@nestjs/common'

describe('MessageService', () => {
  let service: MessageService
  let repository: MessageRepository
  let gateway: MessageGateway

  const mockMessageRepository = {
    sendMessage: jest.fn(),
    getUserConversations: jest.fn(),
    getConversationMessages: jest.fn(),
  }

  const mockMessageGateway = {
    sendToUser: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        {
          provide: MessageRepository,
          useValue: mockMessageRepository,
        },
        {
          provide: MessageGateway,
          useValue: mockMessageGateway,
        },
      ],
    }).compile()

    service = module.get<MessageService>(MessageService)
    repository = module.get<MessageRepository>(MessageRepository)
    gateway = module.get<MessageGateway>(MessageGateway)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('sendMessage', () => {
    it('should send a message successfully', async () => {
      const senderId = 1
      const dto = { receiverId: 2, content: 'Hello' }
      const expectedMessage = { id: 1, senderId, ...dto, createdAt: new Date() }

      mockMessageRepository.sendMessage.mockResolvedValue(expectedMessage)

      const result = await service.sendMessage(senderId, dto)

      expect(repository.sendMessage).toHaveBeenCalledWith(senderId, dto.receiverId, dto.content)
      expect(gateway.sendToUser).toHaveBeenCalledWith(dto.receiverId, 'new_message', expectedMessage)
      expect(gateway.sendToUser).toHaveBeenCalledWith(senderId, 'new_message', expectedMessage)
      expect(result).toEqual(expectedMessage)
    })

    it('should throw BadRequestException if senderId equals receiverId', async () => {
      const senderId = 1
      const dto = { receiverId: 1, content: 'Hello' }

      await expect(service.sendMessage(senderId, dto)).rejects.toThrow(BadRequestException)
      expect(repository.sendMessage).not.toHaveBeenCalled()
      expect(gateway.sendToUser).not.toHaveBeenCalled()
    })
  })

  describe('getConversations', () => {
    it('should return user conversations', async () => {
      const userId = 1
      const expectedConversations = [{ id: 1, userAId: 1, userBId: 2 }]

      mockMessageRepository.getUserConversations.mockResolvedValue(expectedConversations)

      const result = await service.getConversations(userId)

      expect(repository.getUserConversations).toHaveBeenCalledWith(userId)
      expect(result).toEqual(expectedConversations)
    })
  })

  describe('getMessages', () => {
    it('should return conversation messages', async () => {
      const userId = 1
      const conversationId = 100
      const expectedMessages = [{ id: 1, content: 'Hi', conversationId }]

      mockMessageRepository.getConversationMessages.mockResolvedValue(expectedMessages)

      const result = await service.getMessages(userId, conversationId)

      expect(repository.getConversationMessages).toHaveBeenCalledWith(conversationId, userId)
      expect(result).toEqual(expectedMessages)
    })
  })
})
