import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useQuery } from '@apollo/client';
import { GET_USERS_BY_ORG } from '@/graphql/user/queries';
import { GET_TAGS } from '@/graphql/tags/queries';
import UsersMultiSelect from '@/components/users-multi-select';
import TagsMultiSelect from '@/components/tags-multi-select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface NoteFilterProps {
  onFilterChange: (filters: {
    search: string;
    createdBy: string[];
    attendees: string[];
    tags: string[];
    mentions: string[];
  }) => void;
}

export function NoteFilter({ onFilterChange }: NoteFilterProps) {
  const [search, setSearch] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedMentions, setSelectedMentions] = useState<string[]>([]);
  const [selectedCreatedBy, setSelectedCreatedBy] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const { data: userData, loading: userLoading } = useQuery(GET_USERS_BY_ORG);
  const { data: tagData, loading: tagLoading } = useQuery(GET_TAGS);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onFilterChange({
      search: value,
      createdBy: selectedCreatedBy,
      attendees: selectedUsers,
      tags: selectedTags,
      mentions: selectedMentions,
    });
  };

  const handleUserSelect = (users: string[]) => {
    setSelectedUsers(users);
    onFilterChange({
      search,
      createdBy: selectedCreatedBy,
      attendees: users,
      tags: selectedTags,
      mentions: selectedMentions,
    });
  };

  const handleTagSelect = (tags: string[]) => {
    setSelectedTags(tags);
    onFilterChange({
      search,
      createdBy: selectedCreatedBy,
      attendees: selectedUsers,
      tags: tags,
      mentions: selectedMentions,
    });
  };

  const handleMentionSelect = (mentions: string[]) => {
    setSelectedMentions(mentions);
    onFilterChange({
      search,
      createdBy: selectedCreatedBy,
      attendees: selectedUsers,
      tags: selectedTags,
      mentions: mentions,
    });
  };

  const handleCreatedBySelect = (userId: string) => {
    const newSelected = selectedCreatedBy.includes(userId)
      ? selectedCreatedBy.filter(id => id !== userId)
      : [...selectedCreatedBy, userId];
    setSelectedCreatedBy(newSelected);
    onFilterChange({
      search,
      createdBy: newSelected,
      attendees: selectedUsers,
      tags: selectedTags,
      mentions: selectedMentions,
    });
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedUsers([]);
    setSelectedTags([]);
    setSelectedMentions([]);
    setSelectedCreatedBy([]);
    onFilterChange({
      search: '',
      createdBy: [],
      attendees: [],
      tags: [],
      mentions: [],
    });
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search notes..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>

      <Sheet open={showFilters} onOpenChange={setShowFilters}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Filter Notes</SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="space-y-6 py-4">
              {/* Created By */}
              <div className="space-y-2">
                <Label>Created By</Label>
                <div className="space-y-2">
                  {userData?.getUsersByOrg.map((user: any) => (
                    <div key={user.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`created-by-${user.id}`}
                        checked={selectedCreatedBy.includes(user.id)}
                        onCheckedChange={() => handleCreatedBySelect(user.id)}
                      />
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={user.imageUrl} />
                          <AvatarFallback>
                            {user.firstName[0]}
                            {user.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <Label htmlFor={`created-by-${user.id}`}>
                          {user.firstName} {user.lastName}
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attendees */}
              <div className="space-y-2">
                <Label>Attendees</Label>
                <UsersMultiSelect
                  data={userData}
                  loading={userLoading}
                  selected={selectedUsers}
                  setSelectedUsers={handleUserSelect}
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <TagsMultiSelect
                  data={tagData}
                  loading={tagLoading}
                  selected={selectedTags}
                  setSelectedTags={handleTagSelect}
                />
              </div>

              {/* Mentions */}
              <div className="space-y-2">
                <Label>Mentions</Label>
                <UsersMultiSelect
                  data={userData}
                  loading={userLoading}
                  selected={selectedMentions}
                  setSelectedUsers={handleMentionSelect}
                />
              </div>
            </div>
          </ScrollArea>
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
            <Button onClick={() => setShowFilters(false)}>Apply</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
} 