import { Controller, Get, Post, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { AiAssistantService } from './ai-assistant.service';
import { GenerateSuggestionDto } from './dto/generate-suggestion.dto';
import { SaveSuggestionDto } from './dto/save-suggestion.dto';

@ApiTags('ai-assistant')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai-assistant')
export class AiAssistantController {
  constructor(private readonly aiAssistantService: AiAssistantService) {}

  @Post('suggest')
  @ApiOperation({ summary: 'Generate AI suggestions for a project step' })
  generateSuggestions(@Body() dto: GenerateSuggestionDto) {
    return this.aiAssistantService.generateSuggestions(dto);
  }

  @Post('suggestions/save')
  @ApiOperation({ summary: 'Save an AI-generated suggestion' })
  saveSuggestion(@Body() dto: SaveSuggestionDto) {
    return this.aiAssistantService.saveSuggestion(dto);
  }

  @Get('snippets/:type')
  @ApiOperation({ summary: 'Get snippet templates by type' })
  getSnippetsByType(@Param('type') type: string) {
    return this.aiAssistantService.getSnippetsByType(type);
  }

  @Get('snippets')
  @ApiOperation({ summary: 'Get all snippet templates' })
  getAllSnippets() {
    return this.aiAssistantService.getAllSnippets();
  }

  @Patch('suggestions/:id/use')
  @ApiOperation({ summary: 'Mark a suggestion as used' })
  markSuggestionUsed(@Param('id') id: string) {
    return this.aiAssistantService.markSuggestionUsed(id);
  }

  @Get('suggestions/project/:projectId')
  @ApiOperation({ summary: 'Get all suggestions for a project' })
  getProjectSuggestions(@Param('projectId') projectId: string) {
    return this.aiAssistantService.getProjectSuggestions(projectId);
  }
}
