package com.LearnifyMajor.server.Service;

import com.LearnifyMajor.server.DTO.VideoDto;
import com.LearnifyMajor.server.Entity.Video;
import com.LearnifyMajor.server.Exceptions.ResourceNotFoundException;
import com.LearnifyMajor.server.Repository.VideoRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor

public class VideoService {

    private final VideoRepository videoRepository;
    private final ModelMapper mapper;

    public VideoDto getVideoStatus(String jobId){
        Video video = videoRepository.findByJobId(jobId).orElseThrow(()->new ResourceNotFoundException("No job is in queue with Id-"+jobId));
        return mapper.map(video,VideoDto.class);
    }
}
