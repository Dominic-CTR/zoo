package com.zju.courier.service;

import com.zju.courier.entity.Rank;
import com.zju.courier.pojo.SumByDate;
import org.springframework.stereotype.Service;

import java.util.List;

public interface RankService {
    List<SumByDate> query(List<String> apids, String start, String end);

    List<Rank> queryOne(String apid, String start, String end);

}
